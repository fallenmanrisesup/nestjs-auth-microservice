import { IAppConfigProps, IRmqConfigProps } from './subconfigs';

export interface IConfigProps {
  app: IAppConfigProps;
  rmq: IRmqConfigProps;
}
