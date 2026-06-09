import { IsEmail, IsInt, IsString, MinLength } from 'class-validator';

export class sendOtpDto {
  @IsEmail()
  email!: string;
}

export class verifyOtpDto {
  @IsEmail()
  email!: string;

  @IsInt()
  otp!: number;
}

export class registerDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class loginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class forgotSendEmailDto {
  @IsEmail()
  email!: string;
}

export class forgotResetPasswordDto {
  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(6)
  confirmPassword!: string;
}

export class refreshTokenDto {
  @IsString()
  refreshToken!: string;
  @IsString()
  userId!: string;
}
