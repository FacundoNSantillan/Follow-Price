import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('SCRAPPER_SERVICE') private readonly client: ClientProxy,
  ) {}

  async createProduct(url: string) {
    this.client.emit('product_created', { url });
    return { message: 'URL enviada a la cola de procesamiento', url };
  }
}