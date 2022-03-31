import * as vault from '@emeraldpay/emerald-vault-core';
import { SeedDefinition, Uuid } from '@emeraldpay/emerald-vault-core';
import { IBlockchain } from '@emeraldwallet/core';
import { accounts, screen } from '@emeraldwallet/store';
import { ImportMnemonic, ImportPk, NewMnemonic } from '@emeraldwallet/ui';
import { Button, Card, CardActions, CardContent, CardHeader, Step, StepLabel, Stepper } from '@material-ui/core';
import * as bip39 from 'bip39';
import * as React from 'react';
import { connect } from 'react-redux';
import SelectCoins from '../create-account/SelectCoins';
import SelectHDPath from '../create-account/SelectHDPath';
import UnlockSeed from '../create-account/UnlockSeed';
import LedgerWait from '../ledger/LedgerWait';
import Finish from './Finish';
import { CreateWalletFlow, STEP_CODE } from './flow/createWalletFlow';
import { isPk, isPkRaw, Result } from './flow/types';
import SaveMnemonic from './SaveMnemonic';
import SelectKeySource from './SelectKeySource';
import WalletOptions from './WalletOptions';

type Actions = {
  checkGlobalKey(password: string): Promise<boolean>;
  onOpen(walletId: string): void;
};

type OwnProps = {
  blockchains: IBlockchain[];
  seeds: vault.SeedDescription[];
  mnemonicGenerator?: () => Promise<string>;
  onCancel: () => void;
  onCreate: (value: Result) => Promise<string>;
  onError: (err: any) => void;
  onSaveSeed?: (seed: SeedDefinition) => Promise<Uuid>;
};

function isValidMnemonic(text: string): boolean {
  return bip39.validateMnemonic(text);
}

/**
 * Multistep wizard to create a new Wallet. The wallet can be created from an existing or new seed, private key, or just
 * empty without any account initially.
 */
export const CreateWizard: React.FC<Actions & OwnProps> = (props) => {
  const [walletId, setWalletId] = React.useState('');

  function create(result: Result): void {
    props
      .onCreate(result)
      .then((id) => {
        setWalletId(id);
      })
      .catch(props.onError);
  }

  const [step, setStep] = React.useState(new CreateWalletFlow(create));

  const page = step.getCurrentStep();

  const applyWithState = function <T extends unknown[]>(fn: (...args: T) => CreateWalletFlow): (...args: T) => void {
    return (...args) => setStep(fn.call(step, ...args));
  };

  const activeStepIndex = page.index;
  let activeStepPage = null;

  if (page.code == STEP_CODE.KEY_SOURCE) {
    activeStepPage = <SelectKeySource seeds={props.seeds} onSelect={applyWithState(step.applySource)} />;
  } else if (page.code == STEP_CODE.OPTIONS) {
    activeStepPage = <WalletOptions onChange={applyWithState(step.applyOptions)} />;
  } else if (page.code == STEP_CODE.SELECT_BLOCKCHAIN) {
    activeStepPage = (
      <SelectCoins
        blockchains={props.blockchains}
        multiple={!isPk(step.getResult().type)}
        enabled={[]}
        onChange={applyWithState(step.applyBlockchains)}
      />
    );
  } else if (page.code == STEP_CODE.UNLOCK_SEED) {
    activeStepPage = <UnlockSeed seedId={step.getSeedId()} onUnlock={applyWithState(step.applySeedPassword)} />;
  } else if (page.code == STEP_CODE.MNEMONIC_GENERATE) {
    activeStepPage = (
      <NewMnemonic
        onGenerate={props.mnemonicGenerator}
        onContinue={(mnemonic, password) => setStep(step.applyMnemonic(mnemonic, password))}
      />
    );
  } else if (page.code == STEP_CODE.MNEMONIC_IMPORT) {
    activeStepPage = (
      <ImportMnemonic
        onSubmit={(mnemonic, password) => setStep(step.applyMnemonic(mnemonic, password))}
        isValidMnemonic={isValidMnemonic}
      />
    );
  } else if (page.code == STEP_CODE.PK_IMPORT) {
    const result = step.getResult();

    activeStepPage = (
      <ImportPk
        raw={isPkRaw(result.type)}
        checkGlobalKey={props.checkGlobalKey}
        onChange={applyWithState(step.applyImportPk)}
      />
    );
  } else if (page.code == STEP_CODE.LEDGER_OPEN) {
    activeStepPage = <LedgerWait fullSize={true} onConnected={applyWithState(step.applyLedgerConnected)} />;
  } else if (page.code == STEP_CODE.LOCK_SEED) {
    const onLock = (password: string): void => {
      if (!props.onSaveSeed) {
        console.warn('No method to save seed');
        return;
      }
      const save: SeedDefinition = {
        type: 'mnemonic',
        value: {
          value: step.getMnemonic().mnemonic!,
          password: step.getMnemonic().password,
        },
        password,
      };
      props.onSaveSeed(save).then((id) => setStep(step.applyMnemonicSaved(id, password)));
    };
    activeStepPage = <SaveMnemonic onPassword={onLock} />;
  } else if (page.code == STEP_CODE.SELECT_HD_ACCOUNT) {
    const seed = step.getResult().seed;
    if (typeof seed == 'undefined') {
      console.log('Step State', step.getResult());
      throw new Error('Invalid state: seed is undefined');
    }
    activeStepPage = (
      <SelectHDPath
        blockchains={step.getResult().blockchains}
        seed={seed}
        onChange={applyWithState(step.applyHDAccount)}
      />
    );
  } else if (page.code == STEP_CODE.CREATED) {
    activeStepPage = <Finish id={walletId} />;
  }

  const stepper = (
    <Stepper activeStep={activeStepIndex} alternativeLabel={true}>
      {step.getSteps().map((it) => (
        <Step key={it.code}>
          <StepLabel>{it.title}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );

  let controls;

  if (walletId) {
    controls = (
      <Button variant={'contained'} color={'primary'} onClick={() => props.onOpen(walletId)}>
        Open Wallet
      </Button>
    );
  } else {
    controls = (
      <>
        <Button disabled={page.code == STEP_CODE.CREATED} onClick={props.onCancel}>
          Cancel
        </Button>
        <Button
          disabled={!step.canGoNext()}
          onClick={() => setStep(step.applyNext())}
          color={'primary'}
          variant="contained"
        >
          Next
        </Button>
      </>
    );
  }

  return (
    <Card>
      <CardHeader action={stepper} />
      <CardContent>{activeStepPage}</CardContent>
      <CardActions>{controls}</CardActions>
    </Card>
  );
};

export default connect(
  null,
  (dispatch: any): Actions => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    onOpen: (walletId: string) => {
      dispatch(screen.actions.gotoScreen('wallet', walletId));
    },
  }),
)(CreateWizard);
