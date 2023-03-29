import * as vault from '@emeraldpay/emerald-vault-core';
import { SeedDefinition, Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, IBlockchain } from '@emeraldwallet/core';
import { HDPathAddresses, IState, accounts, hdpathPreview, screen } from '@emeraldwallet/store';
import { Button, ButtonGroup, ImportMnemonic, ImportPk, NewMnemonic } from '@emeraldwallet/ui';
import {
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
import WaitLedger from '../ledger/WaitLedger';

const useStyles = makeStyles(
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
  addresses: HDPathAddresses;
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
export const CreateWalletWizard: React.FC<DispatchProps & OwnProps & StateProps> = ({
  addresses,
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

  const prevAddressesState = React.useRef<HDPathAddresses>({});

  const [walletId, setWalletId] = React.useState('');

  const [step, setStep] = React.useState(
    new CreateWalletFlow((result) =>
      onCreate(result)
        .then((id) => setWalletId(id))
        .catch(onError),
    ),
  );

  const onReset = React.useCallback(() => {
    setStep(
      new CreateWalletFlow((result) =>
        onCreate(result)
          .then((id) => setWalletId(id))
          .catch(onError),
      ),
    );
  }, [onCreate, onError]);

  React.useEffect(() => {
    const { current: oldAddresses } = prevAddressesState;

    const blockchains = Object.keys(addresses) as BlockchainCode[];
    const oldBlockchains = Object.keys(oldAddresses) as BlockchainCode[];

    if (
      (oldBlockchains.length > 0 && blockchains.length === 0) ||
      blockchains.reduce((carry, blockchain) => carry || oldAddresses[blockchain] !== addresses[blockchain], false)
    ) {
      prevAddressesState.current = addresses;

      setStep(step.applyAddresses.call(step, addresses));
    }
  }, [addresses, step]);

  const applyWithState = function <T extends unknown[]>(fn: (...args: T) => CreateWalletFlow): (...args: T) => void {
    return (...args) => setStep(fn.call(step, ...args));
  };

  const page = step.getCurrentStep();

  let activeStepPage = null;

  if (page.code === STEP_CODE.KEY_SOURCE) {
    activeStepPage = <SelectKeySource seeds={seeds} onSelect={applyWithState(step.applySource)} />;
  } else if (page.code === STEP_CODE.OPTIONS) {
    activeStepPage = <WalletOptions onChange={applyWithState(step.applyOptions)} />;
  } else if (page.code === STEP_CODE.SELECT_BLOCKCHAIN) {
    activeStepPage = (
      <SelectCoins
        blockchains={blockchains}
        multiple={!isPk(step.getResult().type)}
        enabled={[]}
        onChange={applyWithState(step.applyBlockchains)}
      />
    );
  } else if (page.code === STEP_CODE.UNLOCK_SEED) {
    activeStepPage = <UnlockSeed seedId={step.getSeedId()} onUnlock={applyWithState(step.applySeedPassword)} />;
  } else if (page.code === STEP_CODE.MNEMONIC_GENERATE) {
    activeStepPage = (
      <NewMnemonic
        onGenerate={mnemonicGenerator}
        onContinue={(mnemonic, password) => applyWithState(step.applyMnemonic)(mnemonic, password)}
      />
    );
  } else if (page.code === STEP_CODE.MNEMONIC_IMPORT) {
    activeStepPage = (
      <ImportMnemonic
        onSubmit={(mnemonic, password) => applyWithState(step.applyMnemonic)(mnemonic, password)}
        isValidMnemonic={isValidMnemonic}
      />
    );
  } else if (page.code === STEP_CODE.PK_IMPORT) {
    const result = step.getResult();

    activeStepPage = (
      <ImportPk
        raw={isPkRaw(result.type)}
        checkGlobalKey={checkGlobalKey}
        onChange={applyWithState(step.applyImportPk)}
      />
    );
  } else if (page.code === STEP_CODE.LEDGER_OPEN) {
    activeStepPage = <WaitLedger fullSize onConnected={applyWithState(step.applyLedgerConnected)} />;
  } else if (page.code === STEP_CODE.LOCK_SEED) {
    const onLock = (globalPassword: string): void => {
      if (onSaveSeed == null) {
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

      onSaveSeed(save).then((id) => applyWithState(step.applyMnemonicSaved)(id, globalPassword));
    };

    activeStepPage = <SaveMnemonic onPassword={onLock} />;
  } else if (page.code === STEP_CODE.SELECT_HD_ACCOUNT) {
    const { seed } = step.getResult();

    if (seed == null) {
      throw new Error('Invalid state: seed is undefined');
    }

    activeStepPage = (
      <SelectHDPath
        blockchains={step.getResult().blockchains}
        seed={seed}
        onChange={applyWithState(step.applyAccount)}
      />
    );
  } else if (page.code === STEP_CODE.CREATED) {
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
    controls = <Button primary label="Open Wallet" onClick={() => onOpen(walletId)} />;
  } else {
    controls = (
      <ButtonGroup>
        {(hasWallets || page.code !== STEP_CODE.KEY_SOURCE) && (
          <Button disabled={page.code === STEP_CODE.CREATED} label="Cancel" onClick={hasWallets ? onCancel : onReset} />
        )}
        <Button primary disabled={!step.canGoNext()} label="Next" onClick={() => applyWithState(step.applyNext)()} />
      </ButtonGroup>
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

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => ({
    addresses: hdpathPreview.selectors.getCurrentAddresses(state),
    hasWallets: state.accounts.wallets.length > 0,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    onOpen(walletId) {
      dispatch(screen.actions.gotoScreen('wallet', walletId));
    },
  }),
)(CreateWalletWizard);
