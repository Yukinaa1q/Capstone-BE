import { Body, Get, Post } from '@nestjs/common';
import { ApiAuthController, ApiResponseString } from '@services/openApi';
import { StatService } from './stat.service';

@ApiAuthController('stat')
export class StatController {
  constructor(private readonly statService: StatService) {}

  @Get('income-outcome')
  async getIncomeOutcome() {
    return this.statService.monthStat();
  }

  @Get('income-subject')
  async getIncomeSubject() {
    return this.statService.incomeSubject();
  }
}
