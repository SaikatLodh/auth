import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HelpersModule } from 'src/helpers/helpers.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule, HelpersModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
