import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PersistenceModule } from '../../../libs/persistence/src/persistence.module';
import { ScrapperService } from './scrapper-service.service';
import { ScrapperServiceController } from './scrapper-service.controller';
import { AiModule } from '../../../libs/ai/src/ai.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PersistenceModule,
    AiModule
  ],
  controllers: [ScrapperServiceController],
  providers: [ScrapperService],
})
export class ScrapperServiceModule {}