import app from './app';
import mailgun from './mailgun';
import rmq from './rmq';

const subconfigs = [app, rmq, mailgun];

export default subconfigs;

export { IAppConfigProps } from './app';
export { IRmqConfigProps } from './rmq';
export { IMailgunConfigProps } from './mailgun';
