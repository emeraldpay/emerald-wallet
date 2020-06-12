import {Page} from '@emeraldplatform/ui';
import {Back} from '@emeraldplatform/ui-icons';
import {IState, screen} from '@emeraldwallet/store';
import {
  createStyles,
  Grid,
  Stepper,
  Step,
  StepLabel,
  CardHeader,
  Card,
  CardContent,
  CardActions,
  Button
} from '@material-ui/core';
import * as React from 'react';
import {connect} from 'react-redux';
import * as vault from "@emeraldpay/emerald-vault-core";
import {Dispatch} from "react";
import SelectKeySource from "./SelectKeySource";
import {defaultResult, Result, SeedResult, TWalletOptions} from "./types";
import WalletOptions from "./WalletOptions";
import Finish from "./Finish";

type Props = {}
type Actions = {
  onOpen: (walletId: string) => void,
}

/**
 * Multistep wizard to create a new Wallet. The wallet can be created from an existing or new seed, private key, or just
 * empty without any account initially.
 */
export const CreateWizard = ((props: Props & Actions & OwnProps) => {
  const [result, setResult] = React.useState(defaultResult())
  const [step, setStep] = React.useState('keys-source')
  const [keySource, setKeySource] = React.useState('empty' as SeedResult)
  const [walletId, setWalletId] = React.useState('')

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
  )
  steps.push(
    <Step key="finish">
      <StepLabel>Wallet Created</StepLabel>
    </Step>
  )

  let activeStepIndex = 0;
  let activeStepPage = null;

  if (step == 'keys-source') {
    const onSelect = (value: SeedResult) => {
      setStep('options');
      setKeySource(value);
    }
    activeStepIndex = 0;
    activeStepPage = <SelectKeySource seeds={props.seeds} onSelect={onSelect}/>
  } else if (step == 'options') {
    const onChange = (value: TWalletOptions) => {
      setResult(Object.assign({}, result, {options: value}));
    }
    activeStepIndex = 1;
    activeStepPage = <WalletOptions onChange={onChange}/>
  } else if (step == 'finish') {
    activeStepIndex = 3;
    activeStepPage = <Finish id={walletId} onOpen={() => props.onOpen(walletId)}/>
  }

  const stepper = <Stepper activeStep={activeStepIndex}>
    {steps}
  </Stepper>

  function nextStep() {
    if (step == "options" && keySource == "empty") {
      props.onCreate(result)
        .then((id) => {
          setWalletId(id);
          setStep("finish")
        })
        .catch(props.onError)
    }
  }

  return (
    <Card>
      <CardHeader action={stepper}/>
      <CardContent>{activeStepPage}</CardContent>
      <CardActions>
        <Button disabled={step == 'finish'}
                onClick={props.onCancel}>
          Cancel
        </Button>
        <Button disabled={!(step == 'options' || step != 'finish')}
                onClick={nextStep}
                color={"primary"}
                variant="contained">
          Save
        </Button>
      </CardActions>
    </Card>
  );
});

type OwnProps = {
  seeds: vault.SeedDescription[]
  onCreate: (value: Result) => Promise<string>,
  onError: (err: any) => void,
  onCancel: () => void
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
