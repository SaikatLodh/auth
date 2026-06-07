import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMPT_HOST')!,
      port: parseInt(this.configService.get<string>('SMPT_PORT') || '0'),
      service: this.configService.get<string>('SMPT_SERVICE')!,
      auth: {
        user: this.configService.get<string>('SMPT_MAIL')!,
        pass: this.configService.get<string>('SMPT_PASSWORD')!,
      },
    });
  }

  async sendPasswordResetEmail(mailOption: {
    email: string;
    subject: string;
    message: string;
  }) {
    await this.transporter.sendMail({
      from: this.configService.get<string>('SMPT_MAIL')!,
      to: mailOption.email,
      subject: mailOption.subject,
      html: mailOption.message,
    });
  }
}
