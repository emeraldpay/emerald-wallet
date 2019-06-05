export interface IService {
  readonly id: string;
  start(): void;
  stop(): void;
}

export class Services {

  private services: Map<string, IService> = new Map();

  add(service: IService): void {
    if (this.services.has(service.id)) {
      throw Error(`Service with ID ${service.id} already added`)
    }
    this.services.set(service.id, service);
  }

  start(): void {
    this.services.forEach((svc) => {
      svc.start();
    })
  }

  stop() {
    this.services.forEach((svc) => {
      svc.stop();
    })
  }
}
