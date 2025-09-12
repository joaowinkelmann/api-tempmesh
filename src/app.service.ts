import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AppService {
  constructor(private readonly mailService: MailerService) {}
  getHello(): string {
    return 'Olá mundo!';
  }

  async sendMail() {
    const message = `Forgot your password? If you didn't forget your password, please ignore this email!`;

    await this.mailService.sendMail({
      from: 'Teste da Silva Santiago <noreply@winkels.com.br>',
      to: 'hmaster.studio@gmail.com',
      subject: `How to Send Emails with Nodemailer`,
      text: message,
    });
  }
}
