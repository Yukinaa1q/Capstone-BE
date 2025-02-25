import { IsString } from 'class-validator';

export class UserPayload {
  @IsString()
  role: string;

  @IsString()
  userId: string;

  @IsString()
  userCode: string;

  @IsString()
  name: string;
}
