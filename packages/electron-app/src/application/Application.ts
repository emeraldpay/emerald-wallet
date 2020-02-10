import { Logger } from '@emeraldwallet/core';
import ElectronLogger from '../logging/ElectronLogger';

Logger.setInstance(new ElectronLogger());

export default class Application {
  public log = Logger.forCategory('application');

  public run () {
    this.log.info('Running');
  }
}
