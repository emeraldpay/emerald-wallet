import {defaultResult, isSeedSelected, Result, SeedResult, StepDescription, StepDetails, TWalletOptions} from "./types";
import {BlockchainCode} from "@emeraldwallet/core";

export enum STEP_CODE {
  KEY_SOURCE = "keySource",
  OPTIONS = "options",
  SELECT_BLOCKCHAIN = "selectCoins",
  UNLOCK_SEED = "unlockSeed",
  SELECT_HD_ACCOUNT = "selectAccount",
  CREATED = "created"
}

const STEPS: { [key in STEP_CODE]: StepDescription } = {
  "keySource": {
    code: STEP_CODE.KEY_SOURCE,
    title: "Choose Key Source",
  },
  "options": {
    code: STEP_CODE.OPTIONS,
    title: "Wallet Options",
  },
  "selectCoins": {
    code: STEP_CODE.SELECT_BLOCKCHAIN,
    title: "Select Blockchains",
  },
  "unlockSeed": {
    code: STEP_CODE.UNLOCK_SEED,
    title: "Unlock Seed",
  },
  "selectAccount": {
    code: STEP_CODE.SELECT_HD_ACCOUNT,
    title: "Select HD Account",
  },
  "created": {
    code: STEP_CODE.CREATED,
    title: "Wallet Created",
  }
}

type OnCreate = (result: Result) => void;

export class CreateWalletFlow {
  private result: Result = defaultResult();
  private step: STEP_CODE = STEP_CODE.KEY_SOURCE;
  private onCreate: OnCreate;

  constructor(onCreate: OnCreate) {
    this.onCreate = onCreate;
  }

  static create(result: Result, step: STEP_CODE, onCreate: OnCreate): CreateWalletFlow {
    const instance = new CreateWalletFlow(onCreate);
    instance.result = result;
    instance.step = step;
    return instance;
  }

  getSteps(): StepDescription[] {
    const result: StepDescription[] = [];
    result.push(STEPS[STEP_CODE.KEY_SOURCE]);
    result.push(STEPS[STEP_CODE.OPTIONS]);
    if (this.result.type != 'empty') {
      result.push(STEPS[STEP_CODE.SELECT_BLOCKCHAIN]);
      result.push(STEPS[STEP_CODE.UNLOCK_SEED]);
      result.push(STEPS[STEP_CODE.SELECT_HD_ACCOUNT]);
    }
    result.push(STEPS[STEP_CODE.CREATED]);
    return result
  }

  getCurrentStep(): StepDetails {
    return {
      code: this.step,
      index: this.getSteps().findIndex((it) => it.code == this.step)
    }
  }

  canGoNext(): boolean {
    if (this.step == STEP_CODE.CREATED || this.step == STEP_CODE.KEY_SOURCE || this.step == STEP_CODE.UNLOCK_SEED) {
      return false
    }
    if (this.step == STEP_CODE.SELECT_BLOCKCHAIN) {
      return this.result.blockchains.length > 0;
    }
    if (this.step == STEP_CODE.SELECT_HD_ACCOUNT) {
      return typeof this.result.seedAccount == 'number';
    }
    return true;
  }

  getResult(): Result {
    return this.result;
  }

  private copy(): CreateWalletFlow {
    const copy = new CreateWalletFlow(this.onCreate);
    copy.result = this.result;
    copy.step = this.step;
    return copy;
  }

  // actions

  applyNext(): CreateWalletFlow {
    const copy = this.copy();

    if (this.step == STEP_CODE.OPTIONS) {
      if (this.result.type == 'empty') {
        this.onCreate(this.result);
        copy.step = STEP_CODE.CREATED;
      } else if (isSeedSelected(this.result.type)) {
        copy.step = STEP_CODE.SELECT_BLOCKCHAIN;
      }
    } else if (this.step == STEP_CODE.SELECT_BLOCKCHAIN) {
      copy.step = STEP_CODE.UNLOCK_SEED;
    } else if (this.step == STEP_CODE.SELECT_HD_ACCOUNT) {
      this.onCreate(this.result);
      copy.step = STEP_CODE.CREATED;
    }
    return copy;
  }

  applySource(value: SeedResult): CreateWalletFlow {
    const copy = this.copy();
    copy.result = {...this.result, type: value};
    copy.step = STEP_CODE.OPTIONS;
    return copy;
  }

  applyOptions(value: TWalletOptions): CreateWalletFlow {
    const copy = this.copy();
    copy.result = {...this.result, options: value};
    return copy;
  }

  applyBlockchains(value: BlockchainCode[]): CreateWalletFlow {
    const copy = this.copy();
    copy.result = {...this.result, blockchains: value};
    return copy;
  }

  applySeedPassword(value: string): CreateWalletFlow {
    const copy = this.copy();
    copy.result = {...this.result, seedPassword: value};
    copy.step = STEP_CODE.SELECT_HD_ACCOUNT;
    return copy;
  }

  applyHDAccount(value: number): CreateWalletFlow {
    const copy = this.copy();
    copy.result = {...this.result, seedAccount: value};
    return copy;
  }
}