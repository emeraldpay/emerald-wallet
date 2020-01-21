import { WalletOp } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { addAccount, addresses, IState, screen } from '@emeraldwallet/store';
import { Button, Card, CardActions, CardContent, CardHeader, Grid, Step, StepLabel, Stepper } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import * as React from 'react';
import { connect } from 'react-redux';
import ImportJson from './ImportJson';
import SelectBlockchain from './SelectBlockchain';
import SelectType from './SelectType';
import SelectWallet from './SelectWallet';

interface OwnProps {
}

interface RenderProps {
  wallet: WalletOp;
  page: number;
  type?: addAccount.AddType;
  blockchain?: BlockchainCode;
}

interface DispatchProps {
  nextPage: () => void;
}

const CreateAccountWizard = ((props: RenderProps & DispatchProps) => {
  const { nextPage } = props;
  const { page, type } = props;

  const steps = (
    <Stepper activeStep={page}>
      <Step key='wallet'>
        <StepLabel>Select Wallet</StepLabel>
      </Step>
      <Step key='cryptocurrency'>
        <StepLabel>Select Cryptocurrency</StepLabel>
      </Step>
      <Step key='key'>
        <StepLabel>Select Type</StepLabel>
      </Step>
      <Step key='import'>
        <StepLabel>Import Key</StepLabel>
      </Step>
    </Stepper>
  );

  let content = null;
  if (page == 0) {
    content = <SelectWallet wallet={props.wallet}/>;
  } else if (page == 1) {
    content = <SelectBlockchain />;
  } else if (page == 2) {
    content = <SelectType />;
  } else if (page == 3) {
    if (type === addAccount.AddType.IMPORT_JSON) {
      content = <ImportJson blockchain={props.blockchain!!} wallet={props.wallet.value} />;
    }
  }

  return (
    <Card>
      <CardHeader title={steps}/>
      <CardContent>
        {content}
      </CardContent>
      <CardActions>
        <Button>Cancel</Button>
        <Button variant='contained'
                color='primary'
                onClick={nextPage}
                endIcon={<NavigateNextIcon/>}>Next</Button>
      </CardActions>
    </Card>
  );
});

export default connect<RenderProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const wizardState = addAccount.selectors.getState(state);
    const walletId = wizardState.walletId;
    if (!walletId) {
      throw Error('WalletId is not set');
    }
    const wallet = addresses.selectors.find(state, walletId);
    if (!wallet) {
      throw Error('Wallet is not set');
    }
    return {
      wallet,
      page: wizardState.step,
      type: wizardState.type,
      blockchain: wizardState.blockchain
    };
  },
  (dispatch, ownProps) => {
    return {
      nextPage: () => {
        dispatch(addAccount.actions.nextPage());
      }
    };
  }
)((CreateAccountWizard));
