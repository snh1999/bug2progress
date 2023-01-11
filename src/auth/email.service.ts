import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport } from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {}

  async sendEmail(options) {
    const transporter = createTransport({
      host: this.config.get('EMAIL_HOST'),
      port: this.config.get('EMAIL_PORT'),
      auth: {
        user: this.config.get('EMAIL_USERNAME'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    });
    const mailOptions = {
      from: 'admin <admin@bug2progress.io>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    await transporter.sendMail(mailOptions);
  }
}
