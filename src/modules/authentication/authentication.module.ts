import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtModule } from '@nestjs/jwt';
import { JWT_SECRET } from '@environment';
import { StudentModule } from '@modules/student';
import { TutorModule } from '@modules/tutor/tutor.module';
import { StaffModule } from '@modules/staff';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from '@modules/admin';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: JWT_SECRET,
      signOptions: { expiresIn: '5h' },
    }),
    StudentModule,
    TutorModule,
    StaffModule,
    TypeOrmModule.forFeature([Admin]),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService],
})
export class AuthenticationModule {}
