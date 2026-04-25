import { Injectable, Logger } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/persistence/src/prisma.service';
import { FullH4rdScraper } from './vendors/fullh4rd.scraper';

@Injectable()
export class ScrapperService {
  private readonly logger = new Logger(ScrapperService.name);
  private readonly fullH4rd = new FullH4rdScraper();

  constructor(private readonly prisma: PrismaService) {}

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
}