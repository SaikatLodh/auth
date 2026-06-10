import { Body, Controller, Delete, Get, Patch, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthenticationGuard } from 'src/auth/authentication/authentication.guard';
import type { Request, Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { updatePasswordDto, updateUserDto } from './dto/user.dto';

@UseGuards(AuthenticationGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get("get-users")
  async getUsers(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const result = await this.userService.getAllUser(user.userId);
    return res.json(result);

  }

  @Patch("update-profile")
  @UseInterceptors(FileInterceptor('profileImage'))
  async updateProfile(
    @Body() data: updateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    if (file) {
      const uploadResult = (await this.userService.uploadToCloudinary(
        file,
      )) as any;
      data.profileImage = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }
    const result = await this.userService.updateProfile(user.userId, data);
    return res.json(result);
  }


  @Patch("update-password")
  async updatePassword(@Req() req: Request, @Res() res: Response, @Body() data: updatePasswordDto) {
    const user = (req as any)
      .user

    const result = await this.userService.updatePassword(user.userId, data);
    return res.json(result);
  }

  @Delete("delete-account")
  async deleteAccount(@Req() req: Request, @Res() res: Response) {
    const user = (req as any).user;
    const result = await this.userService.deleteAccount(user.userId);
    return res.json(result);
  }
}


// MONGODB_URL = mongodb+srv://saikatlidhroni20019_db_user:dI94R4qWtlaqGq0v@cluster0.wsy0ghq.mongodb.net/auth
// ACCESS_TOKEN_SECRET = saikat
// ACCESS_TOKEN_EXPIRES_IN = 15m 
// REFRESH_TOKEN_SECRET = lodh
// REFRESH_TOKEN_EXPIRES_IN = 7d
// CLOUDINARY_CLOUD_NAME = dvkyxnqpc
// CLOUDINARY_API_KEY = 457867193262138
// CLOUDINARY_API_SECRET = mzOfIZ5EWbbLovI4xl15Szf6vh4