import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { TranslateNumberPipe } from '../components/shared/translate-number.pipe';

export interface VoiceCommandResult {
  category: string;
  amount: number;
  quantity?: number | null;
  type: 'income' | 'expense';
}

export interface VoiceCommandState {
  isActive: boolean;
  isListening: boolean;
  transcript: string;
}

@Injectable({
  providedIn: 'root'
})
export class VoiceCommandService {
  private recognition: any;
  private witToken = 'CKOVK25SAYA5TAIO5OUMA3B622J5LFBT'; // server token
  private isHolding = false;
  private finalTranscript = '';
  public commandResult = new Subject<VoiceCommandResult>();
  public commandState = new BehaviorSubject<VoiceCommandState>({
    isActive: false,
    isListening: false,
    transcript: ''
  });

  constructor(private translationService: TranslationService) {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      const currentLang = this.translationService.getCurrentLanguage() === 'bn' ? 'bn-BD' : 'en-US';
      this.recognition.lang = currentLang;

      this.recognition.onstart = () => {
        this.updateState({ isActive: true, isListening: true, transcript: '' });
      };

      this.recognition.onresult = async (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            this.finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        const displayTranscript = this.finalTranscript + interimTranscript;
        console.log('Transcript:', displayTranscript);
        this.updateState({ transcript: displayTranscript });
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          this.updateState({ isListening: false, transcript: 'Error: ' + event.error });
        }
      };

      this.recognition.onend = () => {
        if (this.isHolding) {
          this.recognition.start();
        } else {
          if (this.finalTranscript) {
            this.processWithWitAi(this.finalTranscript);
          }
          setTimeout(() => {
            this.updateState({ isActive: false, isListening: false, transcript: '' });
          }, 2000);
        }
      };
    } else {
      console.error('Speech recognition is not supported in this browser');
    }
  }

  private updateState(partialState: Partial<VoiceCommandState>) {
    const currentState = this.commandState.value;
    this.commandState.next({ ...currentState, ...partialState });
  }

  private async processWithWitAi(text: string) {
    try {
      this.updateState({ transcript: this.translationService.getCurrentLanguage() === 'bn' ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'Processing...' });
      
      // Always use English for Wit.ai
      const response = await fetch(`https://api.wit.ai/message?v=20240120&q=${encodeURIComponent(text)}&lang=en`, {
        headers: {
          'Authorization': `Bearer ${this.witToken}`
        }
      });
      
      const data = await response.json();
      console.log('Wit.ai response:', data);
      
      if (data.intents?.[0]?.name === 'add_transaction') {
        const amount = this.extractAmount(data.entities);
        const category = this.extractCategory(data.entities);
        const quantity = this.extractQuantity(data.entities);
        const type = this.determineTransactionType(data.entities);

        console.log('Amount:', amount);
        console.log('Category:', category);
        console.log('Quantity:', quantity);
        console.log('Type:', type);
        if (amount && category) {
          this.commandResult.next({
            category,
            amount,
            quantity,
            type
          });
          this.updateState({ 
            transcript: this.translationService.getCurrentLanguage() === 'bn' 
              ? 'লেনদেন যোগ করা হয়েছে' 
              : 'Transaction added' 
          });
        }
      }
    } catch (error) {
      this.updateState({ 
        transcript: this.translationService.getCurrentLanguage() === 'bn' 
          ? 'ত্রুটি হয়েছে' 
          : 'Error occurred' 
      });
    }
  }

  private extractAmount(entities: any): number | null {
    const amountEntity = entities['amount:amount']?.[0];
        // Convert to english numbers before saving
        const result = new TranslateNumberPipe(this.translationService).transformByLocale(amountEntity?.value, 'en');
    if (amountEntity?.value) {
      return parseFloat(result);
    }
    return null;
  }

  private extractCategory(entities: any): string | null {
    const categoryExpense = entities['category:expense']?.[0];
    const categoryIncome = entities['category:income']?.[0];
    
    if (categoryExpense) {
      return categoryExpense.body;
    } else if (categoryIncome) {
      return categoryIncome.body;
    }
    return null;
  }

  private extractQuantity(entities: any): number | null {
    const quantityEntity = entities['quantity:quantity']?.[0];
    if (quantityEntity?.value) {
      return parseFloat(quantityEntity.value);
    }
    return 1; // Default to 1 if no quantity specified
  }

  private determineTransactionType(entities: any): 'income' | 'expense' {
    return entities['category:income']?.[0] ? 'income' : 'expense';
  }

  private async checkMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Microphone permission error:', error);
      this.updateState({ 
        transcript: this.translationService.getCurrentLanguage() === 'bn' 
          ? 'মাইক্রোফোন অ্যাক্সেস প্রয়োজন' 
          : 'Microphone access needed'
      });
      return false;
    }
  }

  async startListening() {
    this.isHolding = true;
    this.finalTranscript = '';
    
    if (this.recognition) {
      const hasMicPermission = await this.checkMicrophonePermission();
      if (!hasMicPermission) {
        return;
      }

      const currentLang = this.translationService.getCurrentLanguage() === 'bn' ? 'bn-BD' : 'en-US';
      this.recognition.lang = currentLang;
      
      try {
        this.recognition.start();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'NotAllowedError') {
          this.updateState({ 
            transcript: this.translationService.getCurrentLanguage() === 'bn' 
              ? 'মাইক্রোফোন অ্যাক্সেস অনুমতি নেই' 
              : 'Microphone permission denied'
          });
        }
      }
    }
  }

  stopListening() {
    this.isHolding = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping recognition:', error);
      }
    }
  }
}
