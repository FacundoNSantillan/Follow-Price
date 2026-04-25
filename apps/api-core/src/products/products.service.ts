import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../../../libs/persistence/src/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('SCRAPPER_SERVICE') private readonly client: ClientProxy,
    private readonly prisma: PrismaService,
  ) {}

  async createProduct(url: string) {
    this.client.emit('product_created', { url });
    return { message: 'URL enviada a la cola de procesamiento', url };
  }

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        prices: {
          orderBy: { createdAt: 'desc' },
          take: 1, 
        },
      },
    });
  }
}