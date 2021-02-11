export interface MailModuleOptions {
  from: string;
  user: string;
  pass: string;
  port?: string;
}

export interface IEmail {
  // to: string | string[];
  subject: string;
  context: IEmailVars;
}

export interface IEmailVars {
  code: string;
  username: string;
}
