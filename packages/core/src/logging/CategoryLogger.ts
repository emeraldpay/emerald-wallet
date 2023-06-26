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
    if (params.length > 0) {
      this.logger().debug(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...params: any[]): void {
    if (params.length > 0) {
      this.logger().info(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...params: any[]): void {
    if (params.length > 0) {
      this.logger().error(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...params: any[]): void {
    if (params.length > 0) {
      this.logger().warn(`${this.category} - ${params[0]}`, ...params.slice(1));
    }
  }
}
