import { Injectable } from '@angular/core';
import { TranslationService } from './translation.service';
import { Subject } from 'rxjs';

export interface VoiceCommandResult {
  category: string;
  amount: number;
  quantity?: number | null;
  type: 'income' | 'expense';
}

@Injectable({
  providedIn: 'root'
})
export class VoiceCommandService {
  private recognition: any;
  private witToken = 'CKOVK25SAYA5TAIO5OUMA3B622J5LFBT'; // server token
  private currentRecognitionAttempt = 0;
  private maxRecognitionAttempts = 2;
  private languages = ['bn-BD', 'en-US'];
  public commandResult = new Subject<VoiceCommandResult>();

  constructor(private translationService: TranslationService) {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      
      // Start with user's preferred language
      this.recognition.lang = this.translationService.getCurrentLanguage() === 'bn' ? 'bn-BD' : 'en-US';

      this.recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        await this.processWithWitAi(transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.tryNextLanguage();
      };

      this.recognition.onend = () => {
        if (this.currentRecognitionAttempt < this.maxRecognitionAttempts) {
          this.tryNextLanguage();
        } else {
          this.currentRecognitionAttempt = 0;
        }
      };
    }
  }

  private tryNextLanguage() {
    if (this.currentRecognitionAttempt < this.maxRecognitionAttempts) {
      // Switch to the other language
      this.recognition.lang = this.languages[this.currentRecognitionAttempt % this.languages.length];
      this.currentRecognitionAttempt++;
      this.recognition.start();
    }
  }

  private async processWithWitAi(text: string) {
    try {
      const response = await fetch(`https://api.wit.ai/message?v=20240120&q=${encodeURIComponent(text)}`, {
        headers: {
          'Authorization': `Bearer ${this.witToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.intents?.[0]?.name === 'add_transaction') {
        // Extract entities from Wit.ai response
        const amount = this.extractAmount(data.entities);
        const category = this.extractCategory(data.entities);
        const quantity = this.extractQuantity(data.entities);
        const type = this.determineTransactionType(data.entities);

        if (amount && category) {
          this.commandResult.next({
            category,
            amount,
            quantity,
            type
          });
        }
      }
    } catch (error) {
      console.error('Wit.ai processing error:', error);
    }
  }

  private extractAmount(entities: any): number | null {
    const amount = entities['wit$number:amount']?.[0] || entities.amount?.[0];
    return amount?.value || null;
  }

  private extractCategory(entities: any): string | null {
    const category = entities.category?.[0];
    return category?.value || null;
  }

  private extractQuantity(entities: any): number | null {
    const quantity = entities['wit$number:quantity']?.[0] || entities.quantity?.[0];
    return quantity?.value || null;
  }

  private determineTransactionType(entities: any): 'income' | 'expense' {
    const type = entities.transaction_type?.[0]?.value;
    return type === 'income' ? 'income' : 'expense';
  }

  startListening() {
    if (this.recognition) {
      this.currentRecognitionAttempt = 0;
      this.recognition.lang = this.translationService.getCurrentLanguage() === 'bn' ? 'bn-BD' : 'en-US';
      this.recognition.start();
    }
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
      this.currentRecognitionAttempt = 0;
    }
  }
}
