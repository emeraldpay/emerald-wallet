import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { addAccount, IState, screen } from '@emeraldwallet/store';
import { AddType } from '@emeraldwallet/store/lib/add-account';
import { withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import SelectImportType, { ImportTypes } from './SelectImportType';

export const styles = {
  passwordLabel: {
    height: '24px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  passwordSubLabel: {
    height: '22px',
    color: '#191919',
    fontSize: '14px',
    lineHeight: '22px'
  }
};

export interface IProps {
  onCancel?: any;
}

interface IDispatchProps {
  importSeedWallet: any;
  importPrivateKey: any;
  importJson: any;
  generate: any;
}

export const ImportWalletWizard = (props: IProps & IDispatchProps) => {

  function handleCancelClick () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function handleImportSelect (type: any) {
    if (type === ImportTypes.ImportSeedWallet) {
      props.importSeedWallet();
    } else if (type === ImportTypes.ImportPrivateKey) {
      props.importPrivateKey();
    } else if (type === ImportTypes.ImportJSON) {
      props.importJson();
    } else if (type === ImportTypes.GeneratePK) {
      props.generate();
    }
  }

  return (
    <Page
      title={'Import existing wallet'}
      leftIcon={<Back onClick={handleCancelClick}/>}
    >
    <SelectImportType onSelect={handleImportSelect}/>

    </Page>
  );
};

const Styled = withStyles(styles)(ImportWalletWizard);

export default connect<any, any, any, IState>(
  null,
  (dispatch, ownProps) => ({
    onCancel: () => {
      // dispatch(screen.actions.gotoScreen(screen.Pages.NEW_WALLET));
    },
    generate: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.GENERATE_ACCOUNT));
    },
    importSeedWallet: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.IMPORT_SEED_WALLET));
    },
    importPrivateKey: () => {
      dispatch(addAccount.actions.start());
      dispatch(addAccount.actions.setType(AddType.IMPORT_PRIVATE_KEY));
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_ACCOUNT));
    },
    importJson: () => {
      dispatch(addAccount.actions.start());
      dispatch(addAccount.actions.setType(AddType.IMPORT_JSON));
      dispatch(screen.actions.gotoScreen(screen.Pages.ADD_ACCOUNT));
    }
  })
)(Styled);
