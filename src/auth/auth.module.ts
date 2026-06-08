import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/entites/user.entites';
import { Otp, otpSchema } from 'src/entites/otp.entites';
import { MailService } from 'src/helpers/mail.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Otp.name, schema: otpSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule { }
