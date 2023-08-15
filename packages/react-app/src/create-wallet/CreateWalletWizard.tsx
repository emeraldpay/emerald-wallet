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
import SelectCoins from '../create-account/SelectBlockchains';
import SelectHDPath from '../create-account/SelectHDPath';
import UnlockSeed from '../create-account/UnlockSeed';
import WaitLedger from '../ledger/WaitLedger';
import { CreateWalletFlow, STEP_CODE } from './flow/createWalletFlow';
import { Result, isPk, isPkRaw } from './flow/types';
import Created from './steps/Created';
import Creating from './steps/Creating';
import SaveMnemonic from './steps/SaveMnemonic';
import SelectKeySource from './steps/SelectKeySource';
import WalletOptions from './steps/WalletOptions';

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

  const prevAddresses = React.useRef<HDPathAddresses>({});

  const [walletId, setWalletId] = React.useState<string>();

  const [step, setStep] = React.useState(
    new CreateWalletFlow((result) =>
      onCreate(result)
        .then((id) => {
          setWalletId(id);

          applyWithState(step.applyCreated)();
        })
        .catch(onError),
    ),
  );

  const onReset = (): void => {
    setStep(
      new CreateWalletFlow((result) =>
        onCreate(result)
          .then((id) => {
            setWalletId(id);

            applyWithState(step.applyReset)();
          })
          .catch(onError),
      ),
    );
  };

  React.useEffect(() => {
    const { current: oldAddresses } = prevAddresses;

    const blockchains = Object.keys(addresses) as BlockchainCode[];
    const oldBlockchains = Object.keys(oldAddresses) as BlockchainCode[];

    if (
      (oldBlockchains.length > 0 && blockchains.length === 0) ||
      blockchains.reduce((carry, blockchain) => carry || oldAddresses[blockchain] !== addresses[blockchain], false)
    ) {
      prevAddresses.current = addresses;

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
    activeStepPage = (
      <WalletOptions
        onChange={applyWithState(step.applyOptions)}
        onPressEnter={() => applyWithState(step.applyNext)()}
      />
    );
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
  } else if (page.code === STEP_CODE.CREATING) {
    activeStepPage = <Creating />;
  } else if (page.code === STEP_CODE.CREATED) {
    if (walletId == null) {
      throw new Error('Invalid state: wallet id is undefined');
    }

    activeStepPage = <Created walletId={walletId} />;
  }

  const stepper = (
    <Stepper activeStep={page.index} alternativeLabel={true}>
      {step.getSteps().map((item) => (
        <Step key={item.code}>
          <StepLabel>{item.title}</StepLabel>
        </Step>
      ))}
    </Stepper>
  );

  let controls: React.ReactNode;

  if (page.code === STEP_CODE.CREATING || page.code === STEP_CODE.CREATED) {
    controls = (
      <Button
        primary
        disabled={walletId == null}
        label="Open Wallet"
        onClick={() => {
          if (walletId != null) {
            onOpen(walletId);
          }
        }}
      />
    );
  } else {
    controls = (
      <ButtonGroup>
        {(hasWallets || page.code !== STEP_CODE.KEY_SOURCE) && (
          <Button label="Cancel" onClick={hasWallets ? onCancel : onReset} />
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
