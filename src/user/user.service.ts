import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, userDocument } from 'src/entites/user.entites';
import { updatePasswordDto, updateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcryptjs';
import { FileUploadService } from 'src/helpers/file-upload.service';

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<userDocument>, private fileUploadService: FileUploadService) { }

    async getAllUser(userId: string) {
        try {
            const user = await this.userModel
                .findById(userId)
                .select(
                    '-password -__v -forgotPasswordToken -forgotPasswordExpiry',
                );

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            return { status: 200, data: user, message: 'User found successfully' };
        } catch (error) {
            console.log(error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updateProfile(userId: string, updateProfileDto: updateUserDto) {
        try {
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            if (user.profilePicture?.public_id) {
                await this.fileUploadService.deleteFromCloudinary(
                    user.profilePicture.public_id,
                );

                const updatedUser = await this.userModel.findByIdAndUpdate(
                    userId,
                    {
                        fullName: updateProfileDto.fullName,
                        profilePicture: updateProfileDto.profileImage,
                    },
                    {
                        new: true,
                        runValidators: true,
                    },
                );

                if (!updatedUser) {
                    throw new HttpException(
                        'Failed to update user',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }
            } else {
                const updatedUser = await this.userModel.findByIdAndUpdate(
                    userId,
                    {
                        fullName: updateProfileDto.fullName,
                        profilePicture: updateProfileDto.profileImage,
                    },
                    {
                        new: true,
                        runValidators: true,
                    },
                );

                if (!updatedUser) {
                    throw new HttpException(
                        'Failed to update user',
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    );
                }
            }

            return {
                status: 200,
                data: {},
                message: 'User updated successfully',
            };
        } catch (error) {
            console.log(error)
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async updatePassword(userId: string, data: updatePasswordDto) {
        if (data.newPassword !== data.confirmPassword) {
            throw new HttpException(
                'New password and confirm password do not match',
                HttpStatus.BAD_REQUEST,
            );
        }

        const finduser = await this.userModel.findById(userId);
        if (!finduser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const comparePassword = await bcrypt.compare(
            data.oldPassword,
            finduser.password,
        );

        if (!comparePassword) {
            throw new HttpException(
                'Old password is incorrect',
                HttpStatus.BAD_REQUEST,
            );
        }
        data.confirmPassword = await bcrypt.hash(data.confirmPassword, 10);
        finduser.password = data.confirmPassword;
        await finduser.save({ validateBeforeSave: false });

        return { status: 200, data: {}, message: 'Password updated successfully' };
    }

    async deleteAccount(userId: string) {
        const user = await this.userModel.findByIdAndDelete(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        user.isDeleted = true;
        await user.save({ validateBeforeSave: false });
        return { status: 200, data: {}, message: 'Account deleted successfully' };
    }

    async uploadToCloudinary(file: Express.Multer.File) {
        try {
            return await this.fileUploadService.uploadToCloudinary(file);
        } catch {
            throw new HttpException(
                'Upload failed',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
