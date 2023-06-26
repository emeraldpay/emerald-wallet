import CategoryLogger from './CategoryLogger';
import DefaultLogger from './DefaultLogger';
import ILogger from './ILogger';

export default class Logger implements ILogger {
  public static instance: ILogger = new DefaultLogger();

  public static forCategory(category: string): ILogger {
    return new CategoryLogger(() => Logger.instance, category);
  }

  static setInstance(logger: ILogger): void {
    Logger.instance = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...params: any[]): void {
    Logger.instance.debug(params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...params: any[]): void {
    Logger.instance.error(params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...params: any[]): void {
    Logger.instance.info(params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...params: any[]): void {
    Logger.instance.warn(params);
  }
}
