import { BlockchainCode, Wallet } from '@emeraldwallet/core';
import { accounts, addAccount, IState, screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { Card, CardActions, CardContent, CardHeader, Step, StepLabel, Stepper } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import * as React from 'react';
import { connect } from 'react-redux';
import ImportJson from './ImportJson';
import ImportPrivateKey from './ImportPrivateKey';
import SelectBlockchain from './SelectBlockchain';
import SelectType from './SelectType';
import SelectWallet from './SelectWallet';

interface IOwnProps {
}

interface IRenderProps {
  wallet: Wallet;
  page: number;
  type?: addAccount.AddType;
  blockchain: BlockchainCode;
}

interface IDispatchProps {
  nextPage: () => void;
  onCancel: () => void;
}

const CreateAccountWizard = ((props: IRenderProps & IDispatchProps) => {
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

  let displayNextButton = true;
  let content = null;
  if (page === 0) {
    content = <SelectWallet wallet={props.wallet}/>;
  } else if (page === 1) {
    content = <SelectBlockchain />;
  } else if (page === 2) {
    content = <SelectType />;
  } else if (page === 3) {
    if (type === addAccount.AddType.IMPORT_JSON) {
      content = <ImportJson blockchain={props.blockchain} wallet={props.wallet} />;
      displayNextButton = false;
    } else if (type === addAccount.AddType.IMPORT_PRIVATE_KEY) {
      content = <ImportPrivateKey blockchain={props.blockchain} wallet={props.wallet} />;
      displayNextButton = false;
    }
  }

  function handleOnCancelClick () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  return (
    <Card>
      <CardHeader title={steps}/>
      <CardContent>
        {content}
      </CardContent>
      <CardActions>
        <Button label={'Cancel'} onClick={handleOnCancelClick}/>
        {displayNextButton && (
          <Button
            primary={true}
            onClick={nextPage}
            label={'Next'}
            icon={<NavigateNextIcon/>}
          />
          )}
      </CardActions>
    </Card>
  );
});

export default connect<IRenderProps, IDispatchProps, IOwnProps, IState>(
  (state: IState, ownProps: IOwnProps): IRenderProps => {
    const wizardState = addAccount.selectors.getState(state);
    const walletId = wizardState.walletId;
    if (!walletId) {
      throw Error('WalletId is not set');
    }
    const wallet = accounts.selectors.find(state, walletId);
    if (!wallet) {
      throw Error('Wallet is not set');
    }
    return {
      wallet,
      page: wizardState.step,
      type: wizardState.type,
      blockchain: wizardState.blockchain!
    };
  },
  (dispatch: any, ownProps: IOwnProps) => {
    return {
      nextPage: () => {
        dispatch(addAccount.actions.nextPage());
      },
      onCancel: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
      }
    };
  }
)((CreateAccountWizard));
