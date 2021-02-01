import {
  IAppConfigProps,
  IMailgunConfigProps,
  IRmqConfigProps,
} from './subconfigs';

export interface IConfigProps {
  app: IAppConfigProps;
  rmq: IRmqConfigProps;
  mailgun: IMailgunConfigProps;
}
