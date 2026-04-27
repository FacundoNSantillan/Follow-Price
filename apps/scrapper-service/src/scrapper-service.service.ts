import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventPattern } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/persistence/src/prisma.service';
import { FullH4rdScraper } from './vendors/fullh4rd.scraper';
import { ProductsRepository } from '@lib/persistence/src/repositories/products.repository';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private readonly fullH4rd = new FullH4rdScraper();

  constructor(
    private readonly prisma: PrismaService,
    private readonly productsRepo: ProductsRepository
  ) {};
 
  @EventPattern('product_created')
  async handleTrackProduct(data: { url: string }) {
    const { url } = data;
    this.logger.log(`Evento recibido. Procesando URL: ${url}`)
    
    try {
      const scrapedData = await this.fullH4rd.scrape(url);

      const product = await this.prisma.product.upsert({
        where: { url: scrapedData.storeUrl },
        update: {
          image: scrapedData.image,
        },
        create: {
          name: scrapedData.name,
          url: scrapedData.storeUrl,
          store: scrapedData.storeName,
          image: scrapedData.image,
        },
      });

      await this.prisma.priceLog.create({
        data: {
          price: scrapedData.price,
          productId: product.id,
        },
      });

      this.logger.log(`Registro exitoso: ${product.name} - $${scrapedData.price}`);
    } catch (error: any) {
      this.logger.error(`Error al procesar el producto: ${error.message}`);
    }
  }
  @Cron(CronExpression.EVERY_30_SECONDS) 
  async handleCron() {
    this.logger.debug('Iniciando barrido automático de precios');

    const products = await this.productsRepo.findAllWithLastPrice();

    if (products.length === 0) return;
    
    for (const product of products) {
      try {
        const lastPriceEntry = product.prices[0];
        const scrapedData = await this.fullH4rd.scrape(product.url);
        
        if (lastPriceEntry && lastPriceEntry.price === scrapedData.price) {
          this.logger.log(`Simple chequeo: ${product.name} mantiene su precio de $${scrapedData.price}.`);
        } else {
          await this.prisma.priceLog.create({
            data: {
              price: scrapedData.price,
              productId: product.id,
            },
          });
          this.logger.log(`¡CAMBIO DE PRECIO! ${product.name}: $${scrapedData.price}`);
        }

        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error:any) {
        this.logger.error(`Error en ${product.name}: ${error.message}`);
      }
    }
    this.logger.debug('Barrido completado.');
  }
}