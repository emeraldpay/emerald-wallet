import { Grid, Step, StepLabel, Stepper } from '@material-ui/core';
import * as React from 'react';

import Terms from '../Terms';

interface IProps {
  terms?: any;
  onTermsAgreed?: any;
  currentTermsVersion?: any;
}

class InitialSetup extends React.Component<IProps> {

  public render () {
    const {
      terms, onTermsAgreed, currentTermsVersion
    } = this.props;

    let step = null;
    let activeStep = 0;

    if (terms !== currentTermsVersion) {
      step = <Terms onAgree={onTermsAgreed}/>;
    } else {
      activeStep = 1;
    }

    const steps = [];
    steps.push(
      <Step key='terms'>
        <StepLabel>User Agreement</StepLabel>
      </Step>
    );
    steps.push(
      <Step key='open-wallet'>
        <StepLabel>Open Wallet</StepLabel>
      </Step>
    );

    return (
      <Grid>
        <Grid container={true}>
          <Grid item={true} xs={12}>
            <Stepper activeStep={activeStep}>
              {steps}
            </Stepper>
          </Grid>
        </Grid>
        <Grid container={true}>
          <Grid item={true} xs={12}>
            {step}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default InitialSetup;
