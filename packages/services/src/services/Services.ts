import {WebContents} from "electron";

export interface IService {
  readonly id: string;

  start(): void;

  stop(): void;

  setWebContents(webContents: WebContents): void;
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

  setWebContents(webContents: Electron.WebContents): void {
    this.services.forEach((service) =>
      service.setWebContents(webContents)
    )
  }

}
