import { Logger } from '@emeraldwallet/core';
import { WebContents } from 'electron';

export interface IService {
  readonly id: string;
  setWebContents(webContents: WebContents): void;
  start(): void;
  stop(): void;
  reconnect(): void;
}

const log = Logger.forCategory('Services');

export class Services {
  private services: Map<string, IService> = new Map();

  add(service: IService): void {
    if (this.services.has(service.id)) {
      throw new Error(`Service with ID ${service.id} already added`);
    }

    this.services.set(service.id, service);
  }

  start(): void {
    this.services.forEach((service) => service.start());
  }

  stop(): void {
    this.services.forEach((service) => service.stop());
  }

  reconnect(reloaded = false): void {
    if (reloaded) {
      log.info('Reconnect to services after reload web contents...');
    } else {
      log.warn('Reconnect to services...');
    }

    this.services.forEach((service) => service.reconnect());
  }

  setWebContents(webContents: Electron.WebContents): void {
    this.services.forEach((service) => service.setWebContents(webContents));
  }
}
