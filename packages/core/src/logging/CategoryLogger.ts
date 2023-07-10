import ILogger from './ILogger';

export default class CategoryLogger implements ILogger {
  private readonly category: string;

  private logger: () => ILogger;

  /**
   * @param logger is a function which returns logger instance
   * @param category
   */
  constructor(logger: () => ILogger, category: string) {
    this.category = category;
    this.logger = logger;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...params: any[]): void {
    this.logger().debug(`${this.category} >`, ...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...params: any[]): void {
    this.logger().error(`${this.category} >`, ...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...params: any[]): void {
    this.logger().info(`${this.category} >`, ...params);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...params: any[]): void {
    this.logger().warn(`${this.category} >`, ...params);
  }
}
