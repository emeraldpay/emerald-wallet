import CategoryLogger from './CategoryLogger';
import DefaultLogger from './DefaultLogger';
import ILogger from './ILogger';

export default class Logger implements ILogger {
  public static instance: ILogger = new DefaultLogger();

  public static forCategory (category: string): ILogger {
    return new CategoryLogger(Logger.instance, category);
  }

  public static setInstance (logger: ILogger) {
    if (!logger) {
      throw new Error('Invalid argument: logger can not be empty')
    }
    Logger.instance = logger;
  }

  public debug (...params: any[]) {
    Logger.instance.debug(params);
  }

  public warn (...params: any[]) {
    Logger.instance.warn(params);
  }

  public error (...params: any[]) {
    Logger.instance.error(params);
  }

  public info (...params: any[]) {
    Logger.instance.info(params);
  }
}
