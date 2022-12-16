import * as vault from '@emeraldpay/emerald-vault-core';
import { SeedDefinition, Uuid } from '@emeraldpay/emerald-vault-core';
import { IBlockchain } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { ImportMnemonic, ImportPk, NewMnemonic } from '@emeraldwallet/ui';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Step,
  StepLabel,
  Stepper,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import * as bip39 from 'bip39';
import * as React from 'react';
import { connect } from 'react-redux';
import Finish from './Finish';
import { CreateWalletFlow, STEP_CODE } from './flow/createWalletFlow';
import { Result, isPk, isPkRaw } from './flow/types';
import SaveMnemonic from './SaveMnemonic';
import SelectKeySource from './SelectKeySource';
import WalletOptions from './WalletOptions';
import SelectCoins from '../create-account/SelectCoins';
import SelectHDPath from '../create-account/SelectHDPath';
import UnlockSeed from '../create-account/UnlockSeed';
import LedgerWait from '../ledger/LedgerWait';

const useStyles = makeStyles(() =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
    },
    header: {
      flex: 0,
    },
    content: {
      flex: 1,
      minHeight: 100,
      overflowY: 'auto',
    },
    footer: {
      flex: 0,
      float: 'none',
      justifyContent: 'end',
      padding: 16,
    },
  }),
);

interface OwnProps {
  blockchains: IBlockchain[];
  seeds: vault.SeedDescription[];
  mnemonicGenerator?(): Promise<string>;
  onCancel(): void;
  onCreate(value: Result): Promise<string>;
  onError(error: Error): void;
  onSaveSeed?(seed: SeedDefinition): Promise<Uuid>;
}

interface StateProps {
  hasWallets: boolean;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  onOpen(walletId: string): void;
}

function isValidMnemonic(text: string): boolean {
  return bip39.validateMnemonic(text);
}

/**
 * Multistep wizard to create a new Wallet. The wallet can be created from an existing/new seed or private key.
 */
export const CreateWizard: React.FC<DispatchProps & OwnProps & StateProps> = ({
  blockchains,
  hasWallets,
  seeds,
  checkGlobalKey,
  mnemonicGenerator,
  onCancel,
  onCreate,
  onError,
  onOpen,
  onSaveSeed,
}) => {
  const styles = useStyles();

  const [walletId, setWalletId] = React.useState('');

  const [step, setStep] = React.useState(
    new CreateWalletFlow((result) =>
      onCreate(result)
        .then((id) => setWalletId(id))
        .catch(onError),
    ),
  );

  const applyWithState = function <T extends unknown[]>(fn: (...args: T) => CreateWalletFlow): (...args: T) => void {
    return (...args) => setStep(fn.call(step, ...args));
  };

  let activeStepPage = null;

  const page = step.getCurrentStep();

  if (page.code == STEP_CODE.KEY_SOURCE) {
    activeStepPage = <SelectKeySource seeds={seeds} onSelect={applyWithState(step.applySource)} />;
  } else if (page.code == STEP_CODE.OPTIONS) {
    activeStepPage = <WalletOptions onChange={applyWithState(step.applyOptions)} />;
  } else if (page.code == STEP_CODE.SELECT_BLOCKCHAIN) {
    activeStepPage = (
      <SelectCoins
        blockchains={blockchains}
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
        onGenerate={mnemonicGenerator}
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
        checkGlobalKey={checkGlobalKey}
        onChange={applyWithState(step.applyImportPk)}
      />
    );
  } else if (page.code == STEP_CODE.LEDGER_OPEN) {
    activeStepPage = <LedgerWait fullSize={true} onConnected={applyWithState(step.applyLedgerConnected)} />;
  } else if (page.code == STEP_CODE.LOCK_SEED) {
    const onLock = (globalPassword: string): void => {
      if (onSaveSeed == null) {
        console.warn('No method to save seed');

        return;
      }

      const { mnemonic, password } = step.getMnemonic();

      const save: SeedDefinition = {
        password: globalPassword,
        type: 'mnemonic',
        value: {
          password,
          value: mnemonic ?? '',
        },
      };

      onSaveSeed(save).then((id) => setStep(step.applyMnemonicSaved(id, globalPassword)));
    };

    activeStepPage = <SaveMnemonic onPassword={onLock} />;
  } else if (page.code == STEP_CODE.SELECT_HD_ACCOUNT) {
    const seed = step.getResult().seed;

    if (typeof seed == 'undefined') {
      console.log('Step state', step.getResult());
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
    <Stepper activeStep={page.index} alternativeLabel={true}>
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
      <Button variant={'contained'} color={'primary'} onClick={() => onOpen(walletId)}>
        Open Wallet
      </Button>
    );
  } else {
    controls = (
      <>
        {hasWallets && (
          <Button disabled={page.code == STEP_CODE.CREATED} onClick={onCancel}>
            Cancel
          </Button>
        )}
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
    <Card classes={{ root: styles.container }}>
      <CardHeader classes={{ root: styles.header }} action={stepper} />
      <CardContent classes={{ root: styles.content }}>{activeStepPage}</CardContent>
      <CardActions classes={{ root: styles.footer }}>{controls}</CardActions>
    </Card>
  );
};

export default connect(
  (state: IState): StateProps => ({
    hasWallets: state.accounts.wallets.length > 0,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any): DispatchProps => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    onOpen: (walletId: string) => {
      dispatch(screen.actions.gotoScreen('wallet', walletId));
    },
  }),
)(CreateWizard);
