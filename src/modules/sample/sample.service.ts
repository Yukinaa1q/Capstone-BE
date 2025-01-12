import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SampleEntity } from './entity/sample.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SampleService {
  constructor(
    @InjectRepository(SampleEntity)
    private readonly sampleRepository: Repository<SampleEntity>,
  ) {}

  async getSample(): Promise<SampleEntity[]> {
    const res = await this.sampleRepository.find();
    return res;
  }
}
