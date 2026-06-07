import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import {
  forgotResetPasswordDto,
  forgotSendEmailDto,
  loginDto,
  refreshTokenDto,
  registerDto,
  sendOtpDto,
  verifyOtpDto,
} from 'src/dto/auth';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('send-otp')
  async sendOtp(@Body() data: sendOtpDto, @Res() res: Response) {
    const result = await this.authService.sendOtp(data);
    return res.status(200).json(result);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: verifyOtpDto, @Res() res: Response) {
    const result = await this.authService.verifyOtp(data);
    return res.status(200).json(result);
  }

  @Post('register')
  async register(@Body() data: registerDto, @Res() res: Response) {
    const result = await this.authService.register(data);
    return res.status(200).json(result);
  }

  @Post('login')
  async logIn(@Body() data: loginDto, @Res() res: Response) {
    const result = await this.authService.login(data);
    return res.status(200).json(result);
  }

  @Post('forgot-password/send-email')
  async forgotSendEmail(
    @Body() data: forgotSendEmailDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.forgotSendEmail(data);
    return res.status(200).json(result);
  }

  @Post('forgot-password/reset-password')
  async forgotResetPassword(
    @Body() data: forgotResetPasswordDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.forgotResetPassword(data);
    return res.status(200).json(result);
  }

  @Get('refresh-token')
  @UseGuards()
  async refreshToken(
    @Body() refresToken: refreshTokenDto,
    @Res() res: Response,
  ) {
    const result = await this.authService.refreshtoken(refresToken);
    return res.status(200).json(result);
  }
}
