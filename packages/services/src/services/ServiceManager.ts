import { Logger } from '@emeraldwallet/core';
import { WebContents } from 'electron';

export interface Service {
  readonly id: string;
  reconnect(): void;
  setWebContents(webContents: WebContents): void;
  start(): void;
  stop(): void;
}

const log = Logger.forCategory('ServiceManager');

export class ServiceManager {
  private services: Map<string, Service> = new Map();

  add(service: Service): void {
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
