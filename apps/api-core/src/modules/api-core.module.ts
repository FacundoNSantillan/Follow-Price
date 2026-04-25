import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProductsController } from '../products/products.controller';
import { ProductsService } from '../products/products.service';
import { PersistenceModule } from '../../../../libs/persistence/src/persistence.module';

@Module({
  imports: [
    PersistenceModule,
    ClientsModule.register([
      {
        name: 'SCRAPPER_SERVICE',
        transport: Transport.REDIS,
        options: {
          host: 'localhost',
          port: 6379,
        },
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ApiCoreModule {}