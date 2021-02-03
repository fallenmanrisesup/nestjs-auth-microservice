import app from './app';
import rmq from './rmq';

const subconfigs = [app, rmq];

export default subconfigs;

export { IAppConfigProps } from './app';
export { IRmqConfigProps } from './rmq';
