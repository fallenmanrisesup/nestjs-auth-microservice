import app from './app';
import jwt from './jwt';
import postgres from './postgres';
import rmq from './rmq';

const subconfigs = [app, rmq, postgres, jwt];

export default subconfigs;

export { IAppConfigProps } from './app';
export { IRmqConfigProps } from './rmq';
export { IPostgresConfigProps } from './postgres';
export { IJwtConfigProps } from './jwt';
