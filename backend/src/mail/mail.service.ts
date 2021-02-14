import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';
import Mail from 'nodemailer/lib/mailer';
import { CONFIG_OPTIONS } from '../common';
import { handlebarOptions } from './mail.constants';
import { IEmail, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  private mailer: Mail;

  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.mailer = this.init();
  }

  private async sendEmail({ subject, context }: IEmail): Promise<SentMessageInfo>  {
    try {
      const verified = await this.mailer.verify();
      if (!verified) {
        throw new Error(`something went wrong`);
      }

      const mailOptions = {
        from: this.options.from,
        to: 'davit@makeit.am',
        subject,
        template: 'mail.template',
        context,
      };

      return await this.mailer.sendMail(mailOptions);
    } catch (error) {
      console.log(error.message);
    }
  }

  private init() {
    return nodemailer
      .createTransport({
        service: 'gmail',
        port: 2525,
        auth: {
          user: this.options.user,
          pass: this.options.pass,
        },
      })
      .use('compile', hbs(handlebarOptions));
  }

  public sendVerificationEmail(email: string, code: string): Promise<SentMessageInfo> {
    return this.sendEmail({
      subject: 'Verify Your Email',
      context: { code, username: email },
    });
  }
}
