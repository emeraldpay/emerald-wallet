// @flow
import log from 'electron-log';

/**
 * Wrapper for logging mechanism.
 * Future: can be used with any log library under the hood
 */
class Logger {
    category: string;

    constructor(category: string) {
      this.category = category;
    }

    info(text: string, ...params: Array<any>): void {
      this.log(log.info, text, params);
    }

    debug(text: string, ...params: Array<any>): void {
      this.log(log.debug, text, params);
    }

    error(text: string, ...params: Array<any>): void {
      this.log(log.error, text, params);
    }

    warn(text: string, ...params: Array<any>): void {
      this.log(log.warn, text, params);
    }

    trace(text: string, ...params: Array<any>): void {
      this.log(log.verbose, text, params);
    }

    log(func: (...params: any[]) => void, text: string, params: Array<any>) {
      if (params.length > 0) {
        func(`${this.category} - ${text}`, ...params);
      } else {
        func(`${this.category} - ${text}`);
      }
    }
}

const createLogger = (category: string) => new Logger(category);

export default createLogger;
