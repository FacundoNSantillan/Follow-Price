import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventPattern } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/persistence/src/prisma.service';
import { FullH4rdScraper } from './vendors/fullh4rd.scraper';
import { ProductsRepository } from '../../../libs/persistence/src/repositories/products.repository';
import { AiService } from '../../../libs/ai/src/ai.service';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private readonly fullH4rd = new FullH4rdScraper();

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsRepo: ProductsRepository,
    private readonly aiService: AiService 
  ) {};
 
@EventPattern('product_created')
  async handleTrackProduct(data: { url: string }) {
    const { url } = data;
    this.logger.log(`Procesando URL: ${url}`);
    
    try {
      const scrapedData = await this.fullH4rd.scrape(url);
      const aiResult = await this.aiService.normalizeProduct(scrapedData.name);
      this.logger.debug(`IA devolvió: ${JSON.stringify(aiResult)}`);

      const product = await this.prisma.product.upsert({
        where: { url: scrapedData.storeUrl },
        update: { image: scrapedData.image },
        create: {
          name: aiResult.cleanName || scrapedData.name, 
          originalName: scrapedData.name,
          category: aiResult.category || 'General',
          specs: aiResult.specs || {},
          url: scrapedData.storeUrl,
          store: scrapedData.storeName,
          image: scrapedData.image,
        },
      });
      console.log('RESULTADO IA:', aiResult)

      await this.prisma.priceLog.create({
        data: {
          price: scrapedData.price,
          productId: product.id,
        },
      });

      this.logger.log(`¡Éxito! Producto normalizado: ${product.name}`);
    } catch (error: any) {
      this.logger.error(`Error: ${error.message}`);
    }
}

  @Cron(CronExpression.EVERY_5_MINUTES) 
  async handleCron() {
    this.logger.debug('Iniciando barrido automático de precios');

    const products = await this.productsRepo.findAllWithLastPrice();

    if (products.length === 0) return;
    
    for (const product of products) {
      try {
        const lastPriceEntry = product.prices[0];
        const scrapedData = await this.fullH4rd.scrape(product.url);
        
        if (lastPriceEntry && lastPriceEntry.price === scrapedData.price) {
          this.logger.log(`Sin cambios: ${product.name} mantiene su precio.`);
        } else {
          await this.prisma.priceLog.create({
            data: {
              price: scrapedData.price,
              productId: product.id,
            },
          });
          this.logger.log(`¡CAMBIO! ${product.name}: $${scrapedData.price}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error: any) {
        this.logger.error(`Error en ${product.name}: ${error.message}`);
      }
    }
    this.logger.debug('Barrido completado.');
  }
}