import {
  defaultResult, isLedger,
  isPk,
  isPkJson,
  isPkRaw,
  isSeedCreate,
  isSeedSelected,
  KeySourceType,
  KeysSource,
  Result,
  SeedCreate,
  StepDescription,
  StepDetails,
  TWalletOptions
} from "./types";
import {BlockchainCode} from "@emeraldwallet/core";
import {SeedDescription, Uuid} from "@emeraldpay/emerald-vault-core";

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
  PK_IMPORT = "pkImport",
  LEDGER_OPEN = "ledgerOpen"
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
  },
  "pkImport": {
    code: STEP_CODE.PK_IMPORT,
    title: "Import Private Key"
  },
  "ledgerOpen": {
    code: STEP_CODE.LEDGER_OPEN,
    title: "Connect to Ledger"
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
    const useSeedBased = isSeedCreate(this.result.type) || isSeedSelected(this.result.type);
    const useLedger = this.result.type == "start-ledger" || isLedger(this.result.type);
    const needHdAccount = useSeedBased || useLedger;
    const needBlockchain = this.result.type != "empty";

    const result: StepDescription[] = [];
    result.push(STEPS[STEP_CODE.KEY_SOURCE]);
    result.push(STEPS[STEP_CODE.OPTIONS]);

    if (isSeedCreate(this.result.type)) {
      if (this.result.type.type == KeySourceType.SEED_GENERATE) {
        result.push(STEPS[STEP_CODE.MNEMONIC_GENERATE]);
      } else if (this.result.type.type == KeySourceType.SEED_IMPORT) {
        result.push(STEPS[STEP_CODE.MNEMONIC_IMPORT]);
      }
      result.push(STEPS[STEP_CODE.LOCK_SEED]);
    } else if (isPk(this.result.type)) {
      result.push(STEPS[STEP_CODE.PK_IMPORT]);
    } else if (useLedger) {
      result.push(STEPS[STEP_CODE.LEDGER_OPEN]);
    }

    if (needBlockchain) {
      result.push(STEPS[STEP_CODE.SELECT_BLOCKCHAIN]);
    }
    if (isSeedSelected(this.result.type)) {
      result.push(STEPS[STEP_CODE.UNLOCK_SEED]);
    }
    if (needHdAccount) {
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
      this.step == STEP_CODE.LOCK_SEED ||
      this.step == STEP_CODE.LEDGER_OPEN) {
      return false
    }
    if (this.step == STEP_CODE.SELECT_BLOCKCHAIN) {
      return this.result.blockchains.length > 0;
    }
    if (this.step == STEP_CODE.SELECT_HD_ACCOUNT) {
      return typeof this.result.seedAccount == 'number';
    }
    if (this.step == STEP_CODE.PK_IMPORT) {
      return isPkJson(this.result.type) || isPkRaw(this.result.type);
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
        if (this.result.type.type == KeySourceType.SEED_GENERATE) {
          copy.step = STEP_CODE.MNEMONIC_GENERATE;
        } else if (this.result.type.type == KeySourceType.SEED_IMPORT) {
          copy.step = STEP_CODE.MNEMONIC_IMPORT;
        } else {
          throw new Error("Invalid seed type: " + this.result.type.type)
        }
      } else if (isPk(this.result.type)) {
        copy.step = STEP_CODE.PK_IMPORT;
      } else if (this.result.type == "start-ledger") {
        copy.step = STEP_CODE.LEDGER_OPEN;
      }
    } else if (this.step == STEP_CODE.SELECT_BLOCKCHAIN) {
      if (isSeedSelected(this.result.type)) {
        copy.step = STEP_CODE.UNLOCK_SEED;
      } else if (isSeedCreate(this.result.type)) {
        copy.step = STEP_CODE.SELECT_HD_ACCOUNT;
      } else if (isPk(this.result.type)) {
        this.onCreate(this.result);
        copy.step = STEP_CODE.CREATED;
      } else if (isLedger(this.result.type)) {
        copy.step = STEP_CODE.SELECT_HD_ACCOUNT;
      }
    } else if (this.step == STEP_CODE.SELECT_HD_ACCOUNT) {
      this.onCreate(this.result);
      copy.step = STEP_CODE.CREATED;
    } else if (this.step == STEP_CODE.PK_IMPORT) {
      copy.step = STEP_CODE.SELECT_BLOCKCHAIN;
    }
    return copy;
  }

  applySource(value: KeysSource): CreateWalletFlow {
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
    copy.result = {...this.result, seed: {type: "id", password: value, value: copy.result.type.id}};
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
    copy.result = {...this.result, seed: {type: "id", value: id, password}};
    copy.step = STEP_CODE.SELECT_BLOCKCHAIN;
    return copy;
  }

  applyImportPk(value: { raw: string, password: string } | string | undefined): CreateWalletFlow {
    const copy = this.copy();
    if (!isPk(copy.result.type)) {
      throw new Error("Not a PK import");
    }
    if (typeof value == "undefined") {
      // then remove already imported
      copy.result.type = {
        type: KeySourceType.PK_ANY
      }
    } else if (typeof value == 'string') {
      copy.result.type = {
        type: KeySourceType.PK_WEB3_JSON,
        json: value
      }
    } else if (typeof value == 'object') {
      copy.result.type = {
        type: KeySourceType.PK_RAW,
        pk: value.raw,
        password: value.password
      }
    }
    return copy;
  }

  applyLedgerConnected(seed: SeedDescription): CreateWalletFlow {
    if (seed.type != "ledger") {
      return this;
    }
    const copy = this.copy();
    copy.step = STEP_CODE.SELECT_BLOCKCHAIN;
    copy.result.type = {
      type: KeySourceType.LEDGER,
      id: seed.id
    }
    copy.result.seed = {
      type: "ledger",
    }
    return copy;
  }

}