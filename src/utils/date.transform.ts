import { BadRequestException } from '@nestjs/common';
import { isDate, isISO8601 } from 'class-validator';

export const stringToDate = (iso: string | Date) => {
  if (!iso || isDate(iso)) return iso;
  if (isISO8601(iso, { strict: true })) return new Date(iso);

  throw new BadRequestException(`Invalid ISO string Date: ${iso}`);
};
