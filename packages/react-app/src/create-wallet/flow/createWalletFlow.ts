import {
  defaultResult,
  isSeedCreate,
  isSeedSelected,
  Result,
  SeedCreate,
  SeedResult,
  SeedType,
  StepDescription,
  StepDetails,
  TWalletOptions
} from "./types";
import {BlockchainCode} from "@emeraldwallet/core";
import {Uuid} from "@emeraldpay/emerald-vault-core";

export enum STEP_CODE {
  KEY_SOURCE = "keySource",
  OPTIONS = "options",
  SELECT_BLOCKCHAIN = "selectCoins",
  UNLOCK_SEED = "unlockSeed",
  LOCK_SEED = "lockSeed",
  SELECT_HD_ACCOUNT = "selectAccount",
  CREATED = "created",
  MNEMONIC_GENERATE = "mnemonicGenerate",
  MNEMONIC_IMPORT = "mnemonicImport",
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
  },
  "mnemonicGenerate": {
    code: STEP_CODE.MNEMONIC_GENERATE,
    title: "Generate Secret Phrase"
  },
  "mnemonicImport": {
    code: STEP_CODE.MNEMONIC_IMPORT,
    title: "Import Secret Phrase"
  },
  "lockSeed": {
    code: STEP_CODE.LOCK_SEED,
    title: "Save Secret Phrase"
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
    const isSeedBased = isSeedCreate(this.result.type) || isSeedSelected(this.result.type);

    const result: StepDescription[] = [];
    result.push(STEPS[STEP_CODE.KEY_SOURCE]);
    result.push(STEPS[STEP_CODE.OPTIONS]);
    if (isSeedCreate(this.result.type)) {
      if (this.result.type.type == SeedType.GENERATE) {
        result.push(STEPS[STEP_CODE.MNEMONIC_GENERATE]);
      } else if (this.result.type.type == SeedType.IMPORT) {
        result.push(STEPS[STEP_CODE.MNEMONIC_IMPORT]);
      }
      result.push(STEPS[STEP_CODE.LOCK_SEED]);
    }
    if (isSeedBased) {
      result.push(STEPS[STEP_CODE.SELECT_BLOCKCHAIN]);
    }
    if (isSeedSelected(this.result.type)) {
      result.push(STEPS[STEP_CODE.UNLOCK_SEED]);
    }
    if (isSeedBased) {
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
    if (this.step == STEP_CODE.CREATED ||
      this.step == STEP_CODE.KEY_SOURCE ||
      this.step == STEP_CODE.UNLOCK_SEED ||
      this.step == STEP_CODE.MNEMONIC_GENERATE ||
      this.step == STEP_CODE.MNEMONIC_IMPORT ||
      this.step == STEP_CODE.LOCK_SEED) {
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

  getMnemonic(): SeedCreate {
    if (!isSeedCreate(this.result.type)) {
      throw new Error("Not a generated seed");
    }
    return this.result.type;
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
      } else if (isSeedCreate(this.result.type)) {
        if (this.result.type.type == SeedType.GENERATE) {
          copy.step = STEP_CODE.MNEMONIC_GENERATE;
        } else if (this.result.type.type == SeedType.IMPORT) {
          copy.step = STEP_CODE.MNEMONIC_IMPORT;
        } else {
          throw new Error("Invalid seed type: " + this.result.type.type)
        }
      }
    } else if (this.step == STEP_CODE.SELECT_BLOCKCHAIN) {
      if (isSeedSelected(this.result.type)) {
        copy.step = STEP_CODE.UNLOCK_SEED;
      } else if (isSeedCreate(this.result.type)) {
        copy.step = STEP_CODE.SELECT_HD_ACCOUNT;
      }
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
    if (!isSeedSelected(copy.result.type)) {
      throw new Error("Not a seed reference");
    }
    copy.result = {...this.result, unlock: {password: value, id: copy.result.type.id}};
    copy.step = STEP_CODE.SELECT_HD_ACCOUNT;
    return copy;
  }

  applyHDAccount(value: number): CreateWalletFlow {
    const copy = this.copy();
    copy.result = {...this.result, seedAccount: value};
    return copy;
  }

  /**
   *
   * @param mnemonic mnemonic phrase
   * @param password optional mnemonic password (not for encryption)
   */
  applyMnemonic(mnemonic: string, password: string | undefined): CreateWalletFlow {
    const copy = this.copy();
    if (!isSeedCreate(copy.result.type)) {
      throw new Error("Not a generated seed");
    }
    const current: SeedCreate = copy.result.type;
    const type: SeedCreate = {...current, mnemonic, password};
    copy.result = {...this.result, type};
    copy.step = STEP_CODE.LOCK_SEED;
    return copy;
  }

  /**
   *
   * @param id saved seed id
   * @param password encryption password
   */
  applyMnemonicSaved(id: Uuid, password: string): CreateWalletFlow {
    const copy = this.copy();
    if (!isSeedCreate(copy.result.type)) {
      throw new Error("Not a generated seed");
    }
    copy.result = {...this.result, unlock: {id, password}};
    copy.step = STEP_CODE.SELECT_BLOCKCHAIN;
    return copy;
  }
}