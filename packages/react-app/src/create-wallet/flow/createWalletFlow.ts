import { SeedDescription, Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { HDPathAddresses, HDPathIndexes } from '@emeraldwallet/store';
import { ImportPkType } from '@emeraldwallet/ui';
import {
  KeySourceType,
  KeysSource,
  Result,
  SeedCreate,
  StepDescription,
  StepDetails,
  Options,
  defaultResult,
  isLedger,
  isLedgerStart,
  isPk,
  isPkJson,
  isPkRaw,
  isSeedCreate,
  isSeedSelected,
} from './types';

export enum STEP_CODE {
  CREATED = 'created',
  KEY_SOURCE = 'keySource',
  LEDGER_OPEN = 'ledgerOpen',
  LOCK_SEED = 'lockSeed',
  MNEMONIC_GENERATE = 'mnemonicGenerate',
  MNEMONIC_IMPORT = 'mnemonicImport',
  OPTIONS = 'options',
  PK_IMPORT = 'pkImport',
  SELECT_BLOCKCHAIN = 'selectCoins',
  SELECT_HD_ACCOUNT = 'selectAccount',
  UNLOCK_SEED = 'unlockSeed',
}

const STEPS: { [key in STEP_CODE]: StepDescription } = {
  keySource: {
    code: STEP_CODE.KEY_SOURCE,
    title: 'Choose Key Source',
  },
  options: {
    code: STEP_CODE.OPTIONS,
    title: 'Wallet Options',
  },
  selectCoins: {
    code: STEP_CODE.SELECT_BLOCKCHAIN,
    title: 'Select Blockchains',
  },
  unlockSeed: {
    code: STEP_CODE.UNLOCK_SEED,
    title: 'Unlock Seed',
  },
  selectAccount: {
    code: STEP_CODE.SELECT_HD_ACCOUNT,
    title: 'Select HD Account',
  },
  created: {
    code: STEP_CODE.CREATED,
    title: 'Wallet Created',
  },
  mnemonicGenerate: {
    code: STEP_CODE.MNEMONIC_GENERATE,
    title: 'Generate Secret Phrase',
  },
  mnemonicImport: {
    code: STEP_CODE.MNEMONIC_IMPORT,
    title: 'Import Secret Phrase',
  },
  lockSeed: {
    code: STEP_CODE.LOCK_SEED,
    title: 'Save Secret Phrase',
  },
  pkImport: {
    code: STEP_CODE.PK_IMPORT,
    title: 'Import Private Key',
  },
  ledgerOpen: {
    code: STEP_CODE.LEDGER_OPEN,
    title: 'Connect to Ledger',
  },
};

type OnCreate = (result: Result) => void;

export class CreateWalletFlow {
  private result: Result = defaultResult();
  private step: STEP_CODE = STEP_CODE.KEY_SOURCE;

  private readonly onCreate: OnCreate;

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
    const useLedger = isLedgerStart(this.result.type) || isLedger(this.result.type);

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

    result.push(STEPS[STEP_CODE.SELECT_BLOCKCHAIN]);

    if (isSeedSelected(this.result.type)) {
      result.push(STEPS[STEP_CODE.UNLOCK_SEED]);
    }

    if (useSeedBased || useLedger) {
      result.push(STEPS[STEP_CODE.SELECT_HD_ACCOUNT]);
    }

    result.push(STEPS[STEP_CODE.CREATED]);

    return result;
  }

  getCurrentStep(): StepDetails {
    return {
      code: this.step,
      index: this.getSteps().findIndex((it) => it.code == this.step),
    };
  }

  canGoNext(): boolean {
    const { result, step } = this;

    if (
      step === STEP_CODE.CREATED ||
      step === STEP_CODE.KEY_SOURCE ||
      step === STEP_CODE.UNLOCK_SEED ||
      step === STEP_CODE.MNEMONIC_GENERATE ||
      step === STEP_CODE.MNEMONIC_IMPORT ||
      step === STEP_CODE.LOCK_SEED ||
      step === STEP_CODE.LEDGER_OPEN
    ) {
      return false;
    }

    if (step === STEP_CODE.SELECT_BLOCKCHAIN) {
      return result.blockchains.length > 0;
    }

    if (step === STEP_CODE.SELECT_HD_ACCOUNT) {
      return (
        result.seedAccount != null &&
        result.blockchains.reduce((carry, blockchain) => carry && result.addresses?.[blockchain] != null, true)
      );
    }

    if (step === STEP_CODE.PK_IMPORT) {
      const { type } = result;

      return (
        (isPkJson(type) && type.json.length > 0 && type.jsonPassword.length > 0 && type.password.length > 0) ||
        (isPkRaw(type) && type.pk.length > 0 && type.password.length > 0)
      );
    }

    return true;
  }

  getMnemonic(): SeedCreate {
    if (!isSeedCreate(this.result.type)) {
      throw new Error('Not a generated seed');
    }

    return this.result.type;
  }

  getResult(): Result {
    return this.result;
  }

  getSeedId(): Uuid {
    if (isSeedSelected(this.result.type)) {
      return this.result.type.id;
    }

    throw new Error('Not a seed');
  }

  applyNext(): CreateWalletFlow {
    const copy = this.copy();

    if (this.step == STEP_CODE.OPTIONS) {
      if (isSeedSelected(this.result.type)) {
        copy.step = STEP_CODE.SELECT_BLOCKCHAIN;
      } else if (isSeedCreate(this.result.type)) {
        if (this.result.type.type == KeySourceType.SEED_GENERATE) {
          copy.step = STEP_CODE.MNEMONIC_GENERATE;
        } else if (this.result.type.type == KeySourceType.SEED_IMPORT) {
          copy.step = STEP_CODE.MNEMONIC_IMPORT;
        } else {
          throw new Error('Invalid seed type: ' + this.result.type.type);
        }
      } else if (isPk(this.result.type)) {
        copy.step = STEP_CODE.PK_IMPORT;
      } else if (isLedger(this.result.type)) {
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

  applySource(source: KeysSource): CreateWalletFlow {
    const copy = this.copy();

    let type: KeysSource = source;

    if (isLedgerStart(type)) {
      type = {
        type: KeySourceType.LEDGER,
        id: undefined,
      };

      copy.result.seed = {
        type: 'ledger',
      };
    }

    copy.result = { ...copy.result, type };
    copy.step = STEP_CODE.OPTIONS;

    return copy;
  }

  applyOptions(options: Options): CreateWalletFlow {
    const copy = this.copy();

    copy.result = { ...this.result, options };

    return copy;
  }

  applyBlockchains(blockchains: BlockchainCode[]): CreateWalletFlow {
    const copy = this.copy();

    copy.result = { ...this.result, blockchains };

    return copy;
  }

  applySeedPassword(password: string): CreateWalletFlow {
    const copy = this.copy();

    if (!isSeedSelected(copy.result.type)) {
      throw new Error('Not a seed reference');
    }

    copy.result = { ...this.result, seed: { password, type: 'id', value: copy.result.type.id } };
    copy.step = STEP_CODE.SELECT_HD_ACCOUNT;

    return copy;
  }

  applyAccount(seedAccount: number | undefined, indexes: HDPathIndexes): CreateWalletFlow {
    const copy = this.copy();

    copy.result = { ...this.result, indexes, seedAccount };

    return copy;
  }

  applyAddresses(addresses: HDPathAddresses): CreateWalletFlow {
    const copy = this.copy();

    copy.result = { ...this.result, addresses };

    return copy;
  }

  /**
   * @param mnemonic mnemonic phrase
   * @param password optional mnemonic password (not for encryption)
   */
  applyMnemonic(mnemonic: string, password: string | undefined): CreateWalletFlow {
    const copy = this.copy();

    if (!isSeedCreate(copy.result.type)) {
      throw new Error('Not a generated seed');
    }

    copy.result = { ...this.result, type: { ...copy.result.type, mnemonic, password } };
    copy.step = STEP_CODE.LOCK_SEED;

    return copy;
  }

  /**
   * @param id saved seed id
   * @param password encryption password
   */
  applyMnemonicSaved(id: Uuid, password: string): CreateWalletFlow {
    const copy = this.copy();

    if (!isSeedCreate(copy.result.type)) {
      throw new Error('Not a generated seed');
    }

    copy.result = { ...this.result, seed: { type: 'id', value: id, password } };
    copy.step = STEP_CODE.SELECT_BLOCKCHAIN;

    return copy;
  }

  applyImportPk({ json, jsonPassword, password, raw }: ImportPkType): CreateWalletFlow {
    const copy = this.copy();

    if (!isPk(copy.result.type)) {
      throw new Error('Not a PK import');
    }

    if (raw != null) {
      copy.result.type = {
        password,
        pk: raw,
        type: KeySourceType.PK_RAW,
      };
    } else if (json != null && jsonPassword != null) {
      copy.result.type = {
        json,
        jsonPassword,
        password,
        type: KeySourceType.PK_WEB3_JSON,
      };
    }

    return copy;
  }

  applyLedgerConnected(seed: SeedDescription): CreateWalletFlow {
    if (seed.type != 'ledger') {
      return this;
    }

    const copy = this.copy();

    copy.result.seed = {
      type: 'ledger',
    };
    copy.result.type = {
      type: KeySourceType.LEDGER,
      id: seed.id,
    };

    copy.step = STEP_CODE.SELECT_BLOCKCHAIN;

    return copy;
  }

  private copy(): CreateWalletFlow {
    const copy = new CreateWalletFlow(this.onCreate);

    copy.result = this.result;
    copy.step = this.step;

    return copy;
  }
}
