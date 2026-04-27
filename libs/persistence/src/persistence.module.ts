import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ProductsRepository } from './repositories/products.repository';

@Module({
  providers: [
    PrismaService,
    ProductsRepository,
  ],
  exports: [
    PrismaService,
    ProductsRepository,
  ],
})
export class PersistenceModule {}