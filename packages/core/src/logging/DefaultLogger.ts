import ILogger from './ILogger';

export default class DefaultLogger implements ILogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...params: any[]): void {
    console.debug(params[0], params.slice(1));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...params: any[]): void {
    console.error(params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...params: any[]): void {
    console.info(params[0], params.slice(1));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...params: any[]): void {
    console.warn(params);
  }
}
