import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { InjectModel } from '@nestjs/mongoose/dist/common/mongoose.decorators';
import { Model } from 'mongoose';
import {
  forgotResetPasswordDto,
  forgotSendEmailDto,
  loginDto,
  registerDto,
  sendOtpDto,
  verifyOtpDto,
  refreshTokenDto,
} from 'src/dto/auth';
import { Otp, otpDocument } from 'src/entites/otp.entites';
import { User, userDocument } from 'src/entites/user.entites';
import { MailService } from 'src/helpers/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<userDocument>,
    @InjectModel(Otp.name) private otpModel: Model<otpDocument>,
    private jwtService: JwtService,
    private MailService: MailService,
    private configService: ConfigService,
  ) { }
  async sendOtp(sendOtpDto: sendOtpDto) {

  }

  async verifyOtp(verifyOtpDto: verifyOtpDto) {
    // Implement the logic to send OTP here
    // You can use a third-party service like Twilio or any other SMS provider
    // For example:
    // const otp = generateOtp();
    // await smsService.send(sendOtpDto.phoneNumber, `Your OTP is: ${otp}`);
    return { status: 200, data: {}, message: 'OTP sent successfully' };
  }

  async register(registerDto: registerDto) {
    // Implement the logic to register a user here
    // You can save the user details in a database and return a response
    return { status: 200, data: {}, message: 'User registered successfully' };
  }

  async login(loginDto: loginDto) {
    // Implement the logic to login a user here
    // You can validate the user credentials and return a response
    return { status: 200, data: {}, message: 'User logged in successfully' };
  }

  async forgotSendEmail(forgotSendEmailDto: forgotSendEmailDto) {
    // Implement the logic to send OTP here
    // You can use a third-party service like Twilio or any other SMS provider
    // For example:
    // const otp = generateOtp();
    // await smsService.send(sendOtpDto.phoneNumber, `Your OTP is: ${otp}`);
    return { status: 200, data: {}, message: 'OTP sent successfully' };
  }

  async forgotResetPassword(forgotResetPasswordDto: forgotResetPasswordDto) {
    // Implement the logic to send OTP here
    // You can use a third-party service like Twilio or any other SMS provider
    // For example:
    // const otp = generateOtp();
    // await smsService.send(sendOtpDto.phoneNumber, `Your OTP is: ${otp}`);
    return { status: 200, data: {}, message: 'OTP sent successfully' };
  }

  async refreshtoken(refreshTokenDto: refreshTokenDto) {
    // Implement the logic to send OTP here
    // You can use a third-party service like Twilio or any other SMS provider
    // For example:
    // const otp = generateOtp();
    // await smsService.send(sendOtpDto.phoneNumber, `Your OTP is: ${otp}`);
    return { status: 200, data: {}, message: 'OTP sent successfully' };
  }
}
