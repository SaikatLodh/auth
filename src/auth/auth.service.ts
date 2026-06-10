import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
} from 'src/auth/dto/auth';
import { Otp, otpDocument } from 'src/entites/otp.entites';
import { User, userDocument } from 'src/entites/user.entites';
import { MailService } from 'src/helpers/mail.service';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<userDocument>,
    @InjectModel(Otp.name) private otpModel: Model<otpDocument>,
    private jwtService: JwtService,
    private MailService: MailService,
    private configService: ConfigService,
  ) { }

  async generateUserTokens(userId: string) {

    const payload = { userId };


    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),

      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') as any,
      }),
    ]);


    await this.userModel.updateOne({ _id: userId }, { refreshToken });

    return {
      accessToken,
      refreshToken,
    };
  }



  async sendOtp(sendOtpDto: sendOtpDto) {

    try {
      const checkUser = await this.userModel.findOne({
        email: sendOtpDto.email,
      });

      if (checkUser) {

        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      }

      const checkEmail = await this.otpModel.findOne({
        email: sendOtpDto.email,
      });

      if (checkEmail) {
        await this.otpModel.deleteOne({ email: sendOtpDto.email });
      }

      const generateOtp = Math.floor(1000 + Math.random() * 9000);

      const createOtp = await this.otpModel.create({
        email: sendOtpDto.email,
        otp: generateOtp,
        otpExpire: new Date(Date.now() + 2 * 60 * 1000),
      });

      if (!createOtp) {
        throw new HttpException(
          'Failed to send otp',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }


      const mailOption = {
        email: createOtp.email,
        subject: 'OTP for email verification',
        message: `<!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Auth - OTP Verification</title>
     <style>
         body {
             font-family: Arial, sans-serif;
             margin: 0;
             padding: 0;
             background-color: #f4f4f4;
             color: #333;
         }
         .container {
             max-width: 600px;
             margin: 30px auto;
             background-color: #ffffff;
             border-radius: 8px;
             box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
             overflow: hidden;
             border-top: 5px solid #007bff; /* Quick.ai primary color */
         }
         .header {
             padding: 20px;
             text-align: center;
             background-color: #ffffff;
         }
         .header h1 {
             color: #007bff;
             font-size: 24px;
             margin: 0;
         }
         .content {
             padding: 30px;
             text-align: center;
         }
         .otp-box {
             background-color: #e9ecef;
             border-radius: 4px;
             padding: 15px 20px;
             margin: 25px auto;
             display: inline-block;
         }
         .otp-box strong {
             font-size: 32px;
             letter-spacing: 5px;
             color: #000;
         }
         .footer {
             padding: 20px;
             text-align: center;
             font-size: 12px;
             color: #777;
             border-top: 1px solid #eee;
             margin-top: 20px;
         }
         p {
             line-height: 1.6;
         }
     </style>
 </head>
 <body>
     <div class="container">
         <div class="header">
             <h1>Auth Verification</h1>
         </div>
         <div class="content">
             <p>Hi there,</p>
             <p>Thank you for using **Auth**. To complete your login or registration, please use the following One-Time Password (OTP) to verify your identity:</p>
 
             <div class="otp-box">
                 <strong>${createOtp.otp}</strong>
             </div>
 
             <p>This code is valid for 2 minutes.</p>
             <p>If you did not request this code, please ignore this email.</p>
         </div>
         <div class="footer">
             <p>&copy; 2026 Auth. All rights reserved.</p>
             <p>Please do not reply to this email.</p>
         </div>
     </div>
 </body>
 </html>
  `,
      };


      try {
        await this.MailService.sendPasswordResetEmail(mailOption);
        createOtp.isotpsend = true;
        await createOtp.save({ validateBeforeSave: false });
        return { status: 200, data: {}, message: 'OTP sent successfully' };
      } catch (error) {
        console.error('Email sending error:', error);
        throw new HttpException(
          `Error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

  }

  async verifyOtp(verifyOtpDto: verifyOtpDto) {
    try {
      const findOtp = await this.otpModel.findOne({
        email: verifyOtpDto.email,
      });

      if (!findOtp?.isotpsend) {
        throw new HttpException('Otp not sent', HttpStatus.BAD_REQUEST);
      }

      if (findOtp.otp !== Number(verifyOtpDto.otp)) {
        throw new HttpException('Invalid Otp', HttpStatus.BAD_REQUEST);
      }

      const checkOtpExpire = await this.otpModel.findOne({
        otpExpire: { $lt: new Date() },
      });

      if (checkOtpExpire) {
        throw new HttpException('Otp Expired', HttpStatus.BAD_REQUEST);
      }

      findOtp.isotpsend = false;
      findOtp.otpVerified = true;
      await findOtp.save({ validateBeforeSave: false });

      return { status: 200, data: {}, message: 'Otp verified successfully' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async register(registerDto: registerDto) {
    try {
      const verifyEmail = await this.otpModel.findOne({
        email: registerDto.email,
      });

      if (!verifyEmail) {
        throw new HttpException(
          'Enter the verified email',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!verifyEmail.otpVerified) {
        throw new HttpException('Email not verified', HttpStatus.BAD_REQUEST);
      }

      const checkEmail = await this.userModel.findOne({
        email: registerDto.email,
      });

      if (checkEmail) {
        throw new HttpException(
          'User already exists with this email',
          HttpStatus.BAD_REQUEST,
        );
      }

      registerDto.password = await bcrypt.hash(registerDto.password, 10);


      const createUser = await this.userModel.create({
        fullName: registerDto.fullName,
        email: registerDto.email,
        password: registerDto.password,
        isVerified: true,
      });

      if (!createUser) {
        throw new HttpException(
          'Failed to register user',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.otpModel.deleteOne({ email: registerDto.email });
      return { status: 201, data: {}, message: 'User registered successfully' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async login(loginDto: loginDto) {
    try {
      const checkUser = await this.userModel.findOne({ email: loginDto.email });
      if (!checkUser) {
        throw new HttpException('Email does not exists', HttpStatus.BAD_REQUEST);
      }

      if (!checkUser.isVerified) {
        throw new HttpException('Email is not verified"', HttpStatus.BAD_REQUEST);
      }

      if (checkUser.isDeleted) {
        throw new HttpException(
          'User account is deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      const comparePassword = await bcrypt.compare(
        loginDto.password,
        checkUser.password,
      );

      if (!comparePassword) {
        throw new HttpException('Password is incorrect', HttpStatus.BAD_REQUEST);
      }

      const tokens = await this.generateUserTokens(checkUser._id?.toString());


      return {
        status: 200,
        data: { tokens },
        message: 'User logged in successfully',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        `Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotSendEmail(forgotSendEmailDto: forgotSendEmailDto) {
    try {
      const checkEmail = await this.userModel.findOne({
        email: forgotSendEmailDto.email,
      });

      if (!checkEmail) {
        throw new HttpException('Enter the valid email', HttpStatus.BAD_REQUEST);
      }

      const generateToken = crypto.randomBytes(20).toString('hex');

      checkEmail.forgotPasswordToken = crypto
        .createHash('sha256')
        .update(generateToken)
        .digest('hex');
      checkEmail.forgotPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
      await checkEmail.save({ validateBeforeSave: false });

      const resetPasswordUrl = `${this.configService.get('CLIENT_URL')}/forgot-reset-password/${generateToken}`;

      const message = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Auth - Password Reset Request</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border-top: 5px solid #dc3545; /* A color often used for alerts/security */
          }
          .header {
              padding: 20px;
              text-align: center;
              background-color: #ffffff;
          }
          .header h1 {
              color: #dc3545;
              font-size: 24px;
              margin: 0;
          }
          .content {
              padding: 30px;
              text-align: center;
          }
          .button-container {
              margin: 30px 0;
          }
          .button {
              background-color: #007bff; /* Quick.ai primary color for action */
              color: #ffffff;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 5px;
              font-size: 16px;
              font-weight: bold;
              display: inline-block;
          }
          .note {
              background-color: #fff3cd;
              color: #856404;
              padding: 10px;
              border-radius: 4px;
              margin-top: 25px;
              border: 1px solid #ffeeba;
              font-size: 14px;
          }
          .footer {
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #777;
              border-top: 1px solid #eee;
              margin-top: 20px;
          }
          p {
              line-height: 1.6;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Quick.ai Password Reset</h1>
          </div>
          <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset the password for your **Quick.ai** account. To proceed, please click the button below:</p>
  
              <div class="button-container">
                  <a href="${resetPasswordUrl}" class="button">Reset My Password</a>
              </div>
  
              <p>This password reset link will expire in 15 minutes for security reasons.</p>
              
              <div class="note">
                  <strong>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</strong>
              </div>
  
              <p style="margin-top: 20px;">If the button above doesn't work, you can also copy and paste the following link into your web browser:</p>
              <p style="word-break: break-all; font-size: 12px;">${resetPasswordUrl}</p>
          </div>
          <div class="footer">
              <p>&copy; 2026  Auth. All rights reserved.</p>
              <p>Security is our top priority. Please do not reply to this email.</p>
          </div>
      </div>
  </body>
  </html>`;

      const mailOption = {
        email: checkEmail.email,
        subject: 'Auth - Password Reset Request',
        message: message,
      };

      try {
        await this.MailService.sendPasswordResetEmail(mailOption);
        return { status: 200, data: {}, message: 'Email sent successfully' };
      } catch (error) {
        console.error('Email sending error:', error);
        checkEmail.forgotPasswordToken = '';
        checkEmail.forgotPasswordExpiry = new Date(0);
        await checkEmail.save({ validateBeforeSave: false });
        throw new HttpException(
          `Error: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async forgotResetPassword(forgotResetPasswordDto: forgotResetPasswordDto) {
    if (
      forgotResetPasswordDto.password !== forgotResetPasswordDto.confirmPassword
    ) {
      throw new HttpException(
        'Password and confirm password is not same',
        HttpStatus.BAD_REQUEST,
      );
    }

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(forgotResetPasswordDto.token)
      .digest('hex');

    const checkValidation = await this.userModel.findOne({
      forgotPasswordToken: resetPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!checkValidation) {
      throw new HttpException(
        'Token is invalid or expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    forgotResetPasswordDto.confirmPassword = await bcrypt.hash(
      forgotResetPasswordDto.confirmPassword,
      10,
    );
    checkValidation.password = forgotResetPasswordDto.confirmPassword;
    checkValidation.forgotPasswordToken = '';
    checkValidation.forgotPasswordExpiry = new Date(0);

    await checkValidation.save({ validateBeforeSave: false });

    return { status: 200, data: {}, message: 'Password reset successfully' };
  }

  async refreshtoken(refreshTokenDto: refreshTokenDto) {
    const user = await this.userModel.findOne({ refreshToken: refreshTokenDto.refreshToken });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.refreshToken !== refreshTokenDto.refreshToken) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const accessToken = this.jwtService.sign({ userId: refreshTokenDto.userId });

    return {
      status: 200,
      data: { accessToken },
      message: 'Token refreshed successfully',
    };

  }
}