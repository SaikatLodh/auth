import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User, userDocument } from '../../entites/user.entites';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(
        @InjectModel(User.name) private userModel: Model<userDocument>,
        private jwtService: JwtService,
    ) { }

    private extractTokenFromHeader(request: Request): string | undefined {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Unauthorized');
        }
        return token;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Invalid token');
        }

        try {
            const payload = this.jwtService.verify(token);

            const user = await this.userModel.findById(payload.userId);

            if (!user) {
                throw new UnauthorizedException('User not found');
            }
            request.user = user;
            return true;
        } catch (e) {
            Logger.error(e.message);
            throw new UnauthorizedException('Invalid Token');
        }
    }
}