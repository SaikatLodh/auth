import { IsString, IsOptional, MinLength } from 'class-validator';

export class updatePasswordDto {
    @IsString()
    @MinLength(6)
    oldPassword: string;

    @IsString()
    @MinLength(6)
    newPassword: string;

    @IsString()
    @MinLength(6)
    confirmPassword: string;
}

export class updateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    fullName?: string;

    @IsOptional()
    profileImage?: {
        public_id: string;
        url: string;
    };
}