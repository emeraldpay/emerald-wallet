import ILogger from './ILogger';

export default class CategoryLogger implements ILogger {
  private readonly category: string;
  private logger: () => ILogger;

  /**
   * @param logger is a function which returns logger instance
   * @param category
   */
  constructor (logger: () => ILogger, category: string) {
    this.category = category;
    this.logger = logger;
  }

  public debug (...params: any[]) {
    if (params.length > 0) {
      this.logger().debug(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }

  public info (...params: any[]) {
    if (params.length > 0) {
      this.logger().info(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }

  public warn (...params: any[]) {
    if (params.length > 0) {
      this.logger().warn(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }

  public error (...params: any[]) {
    if (params.length > 0) {
      this.logger().error(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }
}
