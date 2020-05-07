import { BlockchainCode } from '@emeraldwallet/core';
import { addAccount, IState, screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { Card, CardActions, CardContent, CardHeader } from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import * as React from 'react';
import { connect } from 'react-redux';
import GenerateAccount from './GenerateAccount';
import ImportJson from './ImportJson';
import ImportPrivateKey from './ImportPrivateKey';
import SelectBlockchain from './SelectBlockchain';

interface IRenderProps {
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

  let displayNextButton = true;
  let content = null;
  if (page === 0) {
    content = <SelectBlockchain />;
  } else if (page === 1) {
    if (type === addAccount.AddType.IMPORT_JSON) {
      content = <ImportJson blockchain={props.blockchain} />;
      displayNextButton = false;
    } else if (type === addAccount.AddType.IMPORT_PRIVATE_KEY) {
      content = <ImportPrivateKey blockchain={props.blockchain} />;
      displayNextButton = false;
    } else if (type === addAccount.AddType.GENERATE_PK) {
      content = <GenerateAccount />;
    }
  }

  function handleOnCancelClick () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  return (
    <Card>
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

export default connect<IRenderProps, IDispatchProps, {}, IState>(
  (state: IState): IRenderProps => {
    const wizardState = addAccount.selectors.getState(state);
    return {
      page: wizardState.step,
      type: wizardState.type,
      blockchain: wizardState.blockchain!
    };
  },
  (dispatch: any) => {
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
