import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private genAI: GoogleGenerativeAI;
  
  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY no definida en el archivo .env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  private async sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async normalizeProduct(rawName: string) {
    try {
      await this.sleep(1000);
      
      const modelName = this.configService.get<string>('GOOGLE_MODEL')!;
      
      const model = this.genAI.getGenerativeModel({ 
        model: modelName,
      });

      const prompt = `Eres un experto en hardware. Normaliza el siguiente nombre de producto a un formato limpio.
      Responde estrictamente con este formato JSON:
      {
        "cleanName": "Nombre Marca Modelo", 
        "category": "Categoría", 
        "specs": { "capacidad": "...", "velocidad": "..." }
      }
      
      Producto: ${rawName}`;
      
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, '').trim();
    return JSON.parse(text);

    } catch (error: any) {
      this.logger.error(`Error en Gemini (${this.configService.get('GOOGLE_MODEL')}): ${error.message}`);
      
      return { 
        cleanName: rawName, 
        category: 'Hardware', 
        specs: {} 
      };
    }
  }
}