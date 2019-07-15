import * as React from 'react';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Grid from '@material-ui/core/Grid';

import Terms from '../Terms';

interface Props {
  terms?: any;
  onTermsAgreed?: any;
  currentTermsVersion?: any;
}

class InitialSetup extends React.Component<Props> {

  render() {
    const {
      terms, onTermsAgreed, currentTermsVersion,
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
      <Step key="terms">
        <StepLabel>User Agreement</StepLabel>
      </Step>
    );
    steps.push(
      <Step key="open-wallet">
        <StepLabel>Open Wallet</StepLabel>
      </Step>
    );

    return (
      <Grid>
        <Grid container>
          <Grid item xs={12}>
            <Stepper activeStep={activeStep}>
              { steps }
            </Stepper>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            { step }
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default InitialSetup;

