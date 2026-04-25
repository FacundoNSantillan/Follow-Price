import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../../libs/persistence/src/persistence.module';
import { ScrapperService } from './scrapper-service.service';
import { ScrapperServiceController } from './scrapper-service.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [ScrapperServiceController],
  providers: [ScrapperService],
})
export class ScrapperServiceModule {}