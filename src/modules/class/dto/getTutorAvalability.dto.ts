import { IsString } from 'class-validator';

export class GetTutorAvailabilityDTO {
  @IsString()
  studyWeek: string;

  @IsString()
  studyShift: string;
}
