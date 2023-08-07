import { Wallet } from '@emeraldpay/emerald-vault-core';
import { Grid, Step, StepLabel, Stepper } from '@material-ui/core';
import * as React from 'react';
import Terms from '../Terms';

export interface OwnProps {
  currentTermsVersion?: string;
}

export interface DispatchProps {
  onTermsAgreed?(wallets: Wallet[]): void;
}

export interface StateProps {
  terms?: string;
}

class InitialSetup extends React.Component<DispatchProps & OwnProps & StateProps> {
  public render(): React.ReactNode {
    const { currentTermsVersion, terms, onTermsAgreed } = this.props;

    return (
      <Grid>
        <Grid container>
          <Grid item xs={12}>
            <Stepper activeStep={terms !== currentTermsVersion ? 0 : 1}>
              <Step key="terms">
                <StepLabel>User Agreement</StepLabel>
              </Step>
              <Step key="open-wallet">
                <StepLabel>Open Wallet</StepLabel>
              </Step>
            </Stepper>
          </Grid>
        </Grid>
        {terms !== currentTermsVersion && (
          <Grid container>
            <Grid item xs={12}>
              <Terms onAgree={onTermsAgreed} />
            </Grid>
          </Grid>
        )}
      </Grid>
    );
  }
}

export default InitialSetup;
