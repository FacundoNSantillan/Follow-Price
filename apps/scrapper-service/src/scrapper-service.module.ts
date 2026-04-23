import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../../libs/persistence/src/persistence.module';
import { ScrapperService } from './scrapper-service.service';

@Module({
  imports: [PersistenceModule],
  providers: [ScrapperService],
})
export class ScrapperServiceModule {}