import {
  IAppConfigProps,
  IRmqConfigProps,
  IPostgresConfigProps,
  IJwtConfigProps,
} from './subconfigs';

export interface IConfigProps {
  app: IAppConfigProps;
  rmq: IRmqConfigProps;
  postgres: IPostgresConfigProps;
  jwt: IJwtConfigProps;
}
