import {IState, screen} from '@emeraldwallet/store';
import {Button, Card, CardActions, CardContent, CardHeader, Step, StepLabel, Stepper} from '@material-ui/core';
import * as React from 'react';
import {Dispatch} from 'react';
import {connect} from 'react-redux';
import * as vault from "@emeraldpay/emerald-vault-core";
import SelectKeySource from "./SelectKeySource";
import {defaultResult, isSeedSelected, Result, SeedResult, SeedSelected, TWalletOptions} from "./types";
import WalletOptions from "./WalletOptions";
import Finish from "./Finish";
import SelectCoins from "../create-account/SelectCoins";
import {BlockchainCode, IBlockchain} from "@emeraldwallet/core";
import SelectHDPath from "../create-account/SelectHDPath";
import {SourceSeed} from "@emeraldwallet/store/lib/hdpath-preview/types";
import UnlockSeed from "../create-account/UnlockSeed";

type Props = {}
type Actions = {
  onOpen: (walletId: string) => void,
}

enum Steps {
  KEY_SOURCE,
  OPTIONS,
  SELECT_COINS,
  UNLOCK_SEED,
  SELECT_ACCOUNT,
  FINISH
}

/**
 * Multistep wizard to create a new Wallet. The wallet can be created from an existing or new seed, private key, or just
 * empty without any account initially.
 */
export const CreateWizard = ((props: Props & Actions & OwnProps) => {
  const [result, setResult] = React.useState(defaultResult());
  const [step, setStep] = React.useState(Steps.KEY_SOURCE);
  const [keySource, setKeySource] = React.useState('empty' as SeedResult);
  const [walletId, setWalletId] = React.useState('');
  const [password, setPassword] = React.useState('');

  const steps = [];
  steps.push(
    <Step key="keys-source">
      <StepLabel>Choose Key Source</StepLabel>
    </Step>
  )
  steps.push(
    <Step key="options">
      <StepLabel>Wallet Options</StepLabel>
    </Step>
  )
  steps.push(
    <Step key="select-coins" disabled={keySource == 'empty'}>
      <StepLabel>Select Blockchains</StepLabel>
    </Step>
  );
  steps.push(
    <Step key="unlock-seed" disabled={keySource == 'empty'}>
      <StepLabel>Unlock Seed</StepLabel>
    </Step>
  );
  steps.push(
    <Step key="select-account" disabled={keySource == 'empty'}>
      <StepLabel>Select HD Account</StepLabel>
    </Step>
  );
  steps.push(
    <Step key="finish">
      <StepLabel>Wallet Created</StepLabel>
    </Step>
  );

  let activeStepIndex = 0;
  let activeStepPage = null;

  if (step == Steps.KEY_SOURCE) {
    const onSelect = (value: SeedResult) => {
      setStep(Steps.OPTIONS);
      setKeySource(value);
      setResult({...result, type: value});
    }
    activeStepIndex = 0;
    activeStepPage = <SelectKeySource seeds={props.seeds} onSelect={onSelect}/>
  } else if (step == Steps.OPTIONS) {
    const onChange = (value: TWalletOptions) => {
      setResult({...result, options: value});
    }
    activeStepIndex = 1;
    activeStepPage = <WalletOptions onChange={onChange}/>
  } else if (step == Steps.SELECT_COINS) {
    activeStepIndex = 2;
    const onChange = (value: BlockchainCode[]) => {
      setResult({...result, blockchains: value})
    }
    activeStepPage = <SelectCoins blockchains={props.blockchains} enabled={[]} onChange={onChange}/>;
  } else if (step == Steps.UNLOCK_SEED) {
    const onUnlock = (value: string) => {
      setPassword(value);
      setStep(Steps.SELECT_ACCOUNT);
      setResult({...result, seedPassword: value})
    }
    activeStepIndex = 3;
    activeStepPage = <UnlockSeed onUnlock={onUnlock}/>
  } else if (step == Steps.SELECT_ACCOUNT) {
    const seed: SourceSeed = {
      type: "seed-ref",
      seedId: (keySource as SeedSelected).id,
      password: password
    }
    const onChange = (account: number) => {
      setResult({...result, seedAccount: account});
    }
    activeStepIndex = 4;
    activeStepPage = <SelectHDPath blockchains={result.blockchains}
                                   seed={seed}
                                   onChange={onChange}/>
  } else if (step == Steps.FINISH) {
    activeStepIndex = 5;
    activeStepPage = <Finish id={walletId} onOpen={() => props.onOpen(walletId)}/>
  }

  const stepper = <Stepper activeStep={activeStepIndex}>
    {steps}
  </Stepper>

  function create() {
    props.onCreate(result)
      .then((id) => {
        setWalletId(id);
        setStep(Steps.FINISH)
      })
      .catch(props.onError);
  }

  function nextStep() {
    if (step == Steps.OPTIONS) {
      if (keySource == "empty") {
        create();
      } else if (isSeedSelected(keySource)) {
        setStep(Steps.SELECT_COINS);
      }
    } else if (step == Steps.SELECT_COINS) {
      setStep(Steps.UNLOCK_SEED)
    } else if (step == Steps.SELECT_ACCOUNT) {
      create();
    }
  }

  let nextEnabled = true;
  nextEnabled = nextEnabled && step != Steps.FINISH;
  nextEnabled = nextEnabled && step != Steps.KEY_SOURCE;
  nextEnabled = nextEnabled && step != Steps.UNLOCK_SEED;
  if (step == Steps.SELECT_COINS) {
    nextEnabled = nextEnabled && result.blockchains.length > 0;
  }
  if (step == Steps.SELECT_ACCOUNT) {
    nextEnabled = nextEnabled && typeof result.seedAccount == 'number';
  }

  return (
    <Card>
      <CardHeader action={stepper}/>
      <CardContent>{activeStepPage}</CardContent>
      <CardActions>
        <Button disabled={step == Steps.FINISH}
                onClick={props.onCancel}>
          Cancel
        </Button>
        <Button disabled={!nextEnabled}
                onClick={nextStep}
                color={"primary"}
                variant="contained">
          Next
        </Button>
      </CardActions>
    </Card>
  );
});

type OwnProps = {
  seeds: vault.SeedDescription[]
  onCreate: (value: Result) => Promise<string>,
  onError: (err: any) => void,
  onCancel: () => void,
  blockchains: IBlockchain[]
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
