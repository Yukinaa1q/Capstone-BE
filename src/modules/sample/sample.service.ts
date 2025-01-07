import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SampleEntity } from './entity/sample.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SampleService {
  constructor() {}

  getSample(): string {
    return 'Hello!';
  }
}
