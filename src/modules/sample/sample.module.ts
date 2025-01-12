import { Module } from '@nestjs/common';
import { SampleController } from './sample.controller';
import { SampleService } from './sample.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SampleEntity } from './entity/sample.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SampleEntity])],
  controllers: [SampleController],
  providers: [SampleService],
})
export class SampleModule {}
