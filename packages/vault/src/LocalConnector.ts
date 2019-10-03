import {DefaultLogger, ILogger} from '@emeraldwallet/core';
import {EmeraldVaultNative} from "@emeraldpay/emerald-vault-node";
import {IVaultProvider} from "./types";
import {NativeVaultProvider} from "./NativeProvider";

export class LocalConnector {
  public dataDir: string;
  public log: ILogger;
  private vault: EmeraldVaultNative;

  // TODO: assert params
  constructor (dataDir: string, log?: ILogger) {
    this.dataDir = dataDir;
    this.log = log || new DefaultLogger();
    this.vault = new EmeraldVaultNative({
      dir: this.dataDir
    });
  }

  /**
   * @deprecated
   */
  public start() {
  }

  /**
   * @deprecated
   */
  public shutdown() {
  }

  getProvider(): IVaultProvider {
    return new NativeVaultProvider(this.vault);
  }

}
