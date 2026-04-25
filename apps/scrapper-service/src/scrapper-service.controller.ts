import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { ScrapperService } from './scrapper-service.service';

@Controller()
export class ScrapperServiceController {
  constructor(private readonly scrapperService: ScrapperService) {}

  @EventPattern('product_created')
  async handleProductCreated(data: { url: string }) {
    await this.scrapperService.handleTrackProduct(data);
  }
}