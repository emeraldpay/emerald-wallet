import ILogger from './ILogger';

export default class DefaultLogger implements ILogger {
  public debug (...params: any[]) {
    console.debug(params[0], params.slice(1));
  }

  public error (...params: any[]) {
    console.error(params);
  }

  public warn (...params: any[]) {
    console.warn(params);
  }

  public info (...params: any[]) {
    console.info(params[0], params.slice(1));
  }
}
