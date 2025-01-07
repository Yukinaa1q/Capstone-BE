import { Body, Get, Post } from '@nestjs/common';
import { ApiAuthController, ApiResponseString } from '@services/openApi';
import { SampleService } from './sample.service';
import { SampleEntity } from './entity/sample.entity';

@ApiAuthController('sample')
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  @ApiResponseString()
  getSample(): string {
    return this.sampleService.getSample();
  }

  @Post()
  @ApiResponseString()
  createSample(@Body() body: SampleEntity): string {
    console.log('body', body);
    return 'hello';
  }
}
