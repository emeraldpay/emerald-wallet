import {WebContents} from "electron";
import {Logger} from "@emeraldwallet/core";

const log = Logger.forCategory('Services');

export interface IService {
  readonly id: string;

  start(): void;

  stop(): void;

  setWebContents(webContents: WebContents): void;

  reconnect(): void;
}

export class Services {

  private services: Map<string, IService> = new Map();

  public add (service: IService): void {
    if (this.services.has(service.id)) {
      throw Error(`Service with ID ${service.id} already added`);
    }
    this.services.set(service.id, service);
  }

  public start (): void {
    this.services.forEach((svc) => {
      svc.start();
    });
  }

  public stop() {
    this.services.forEach((svc) => {
      svc.stop();
    });
  }

  public setWebContents(webContents: Electron.WebContents): void {
    this.services.forEach((service) =>
      service.setWebContents(webContents)
    )
  }

  public reconnect(): void {
    log.warn("Reconnect to services");
    this.services.forEach((svc) => {
      svc.reconnect();
    });
  }
}
