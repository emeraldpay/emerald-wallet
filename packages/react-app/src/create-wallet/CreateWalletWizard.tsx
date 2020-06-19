import {IState, screen} from '@emeraldwallet/store';
import {Button, Card, CardActions, CardContent, CardHeader, Step, StepLabel, Stepper} from '@material-ui/core';
import * as React from 'react';
import {Dispatch} from 'react';
import {connect} from 'react-redux';
import * as vault from "@emeraldpay/emerald-vault-core";
import SelectKeySource from "./SelectKeySource";
import {defaultResult, isSeedSelected, Result, KeysSource, SeedSelected, TWalletOptions, isPk} from "./flow/types";
import WalletOptions from "./WalletOptions";
import Finish from "./Finish";
import SelectCoins from "../create-account/SelectCoins";
import {BlockchainCode, IBlockchain} from "@emeraldwallet/core";
import SelectHDPath from "../create-account/SelectHDPath";
import UnlockSeed from "../create-account/UnlockSeed";
import {CreateWalletFlow, STEP_CODE} from "./flow/createWalletFlow";
import {ImportMnemonic, ImportPk, NewMnemonic} from "@emeraldwallet/ui";
import SaveMnemonic from "./SaveMnemonic";
import {SeedDefinition, Uuid} from "@emeraldpay/emerald-vault-core";
import LedgerWait from "../ledger/LedgerWait";

type Props = {}
type Actions = {
  onOpen: (walletId: string) => void,
}

/**
 * Multistep wizard to create a new Wallet. The wallet can be created from an existing or new seed, private key, or just
 * empty without any account initially.
 */
export const CreateWizard = ((props: Props & Actions & OwnProps) => {
  function create(result: Result) {
    props.onCreate(result)
      .then((id) => {
        setWalletId(id);
      })
      .catch(props.onError);
  }

  const [step, setStep] = React.useState(new CreateWalletFlow(create));
  const [walletId, setWalletId] = React.useState('');

  const page = step.getCurrentStep();
  const applyWithState = function <T>(fn: (value: T) => CreateWalletFlow): (value: T) => void {
    return (x) => {
      const next = fn.call(step, x);
      setStep(next);
    }
  }
  let activeStepIndex = page.index;
  let activeStepPage = null;

  if (page.code == STEP_CODE.KEY_SOURCE) {
    activeStepPage = <SelectKeySource seeds={props.seeds} onSelect={applyWithState(step.applySource)}/>
  } else if (page.code == STEP_CODE.OPTIONS) {
    activeStepPage = <WalletOptions onChange={applyWithState(step.applyOptions)}/>
  } else if (page.code == STEP_CODE.SELECT_BLOCKCHAIN) {
    activeStepPage =
      <SelectCoins blockchains={props.blockchains}
                   multiple={!isPk(step.getResult().type)}
                   enabled={[]}
                   onChange={applyWithState(step.applyBlockchains)}/>;
  } else if (page.code == STEP_CODE.UNLOCK_SEED) {
    activeStepPage = <UnlockSeed onUnlock={applyWithState(step.applySeedPassword)}/>
  } else if (page.code == STEP_CODE.MNEMONIC_GENERATE) {
    activeStepPage = <NewMnemonic onGenerate={props.mnemonicGenerator}
                                  onContinue={(mnemonic, password) =>
                                    setStep(step.applyMnemonic(mnemonic, password))
                                  }/>
  } else if (page.code == STEP_CODE.MNEMONIC_IMPORT) {
    activeStepPage = <ImportMnemonic onSubmit={(mnemonic, password) =>
      setStep(step.applyMnemonic(mnemonic, password))
    }/>
  } else if (page.code == STEP_CODE.PK_IMPORT) {
    activeStepPage = <ImportPk onChange={applyWithState(step.applyImportPk)}/>;
  } else if (page.code == STEP_CODE.LEDGER_OPEN) {
    activeStepPage = <LedgerWait fullSize={true} onConnected={applyWithState(step.applyLedgerConnected)}/>;
  } else if (page.code == STEP_CODE.LOCK_SEED) {
    const onLock = (password: string) => {
      if (!props.onSaveSeed) {
        console.warn("No method to save seed");
        return;
      }
      const save: SeedDefinition = {
        type: "mnemonic",
        value: {
          value: step.getMnemonic().mnemonic,
          password: step.getMnemonic().password
        },
        password
      }
      props.onSaveSeed(save).then((id) =>
        setStep(step.applyMnemonicSaved(id, password))
      );
    }
    activeStepPage = <SaveMnemonic mnemonic={step.getMnemonic().mnemonic!}
                                   onPassword={onLock}/>
  } else if (page.code == STEP_CODE.SELECT_HD_ACCOUNT) {
    activeStepPage = <SelectHDPath blockchains={step.getResult().blockchains}
                                   seed={step.getResult().seed!}
                                   onChange={applyWithState(step.applyHDAccount)}/>
  } else if (page.code == STEP_CODE.CREATED) {
    activeStepPage = <Finish id={walletId}/>
  }

  const stepper = <Stepper activeStep={activeStepIndex} alternativeLabel={true}>
    {step.getSteps().map((it) => (
      <Step key={it.code}>
        <StepLabel>{it.title}</StepLabel>
      </Step>
    ))}
  </Stepper>

  let controls;

  if (walletId) {
    controls = <Button variant={"contained"}
                       color={"primary"} onClick={() => props.onOpen(walletId)}>Open Wallet</Button>;
  } else {
    controls = <>
      <Button disabled={page.code == STEP_CODE.CREATED}
              onClick={props.onCancel}>
        Cancel
      </Button>
      <Button disabled={!step.canGoNext()}
              onClick={() => setStep(step.applyNext())}
              color={"primary"}
              variant="contained">
        Next
      </Button>
    </>
  }

  return (
    <Card>
      <CardHeader action={stepper}/>
      <CardContent>{activeStepPage}</CardContent>
      <CardActions>{controls}</CardActions>
    </Card>
  );
});

type OwnProps = {
  seeds: vault.SeedDescription[]
  onCreate: (value: Result) => Promise<string>,
  onError: (err: any) => void,
  onCancel: () => void,
  blockchains: IBlockchain[],
  mnemonicGenerator?: () => Promise<string>,
  onSaveSeed?: (seed: SeedDefinition) => Promise<Uuid>
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onOpen: (walletId: string) => {
        dispatch(screen.actions.gotoScreen("wallet", walletId))
      }
    }
  }
)((CreateWizard));
