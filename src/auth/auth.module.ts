import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/entites/user.entites';
import { Otp, otpSchema } from 'src/entites/otp.entites';
import { HelpersModule } from 'src/helpers/helpers.module';
import { AuthenticationGuard } from './authentication/authentication.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: userSchema },
      { name: Otp.name, schema: otpSchema },
    ]),
    HelpersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthenticationGuard, MongooseModule],
  exports: [AuthService, AuthenticationGuard, MongooseModule],
})
export class AuthModule { }
