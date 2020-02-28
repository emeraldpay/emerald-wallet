import { screen } from '@emeraldwallet/store';
import { DashboardMenu as Menu } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

const { gotoScreen, showDialog } = screen.actions;
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: '8px',
    height: '50px'
  },
  title: {
    fontSize: '14px',
    fontWeight: 500
  }
};

export interface IHeaderProps {
  generate: any;
  importJson: any;
  importLedger: any;
  importPrivateKey: any;
  importMnemonic: any;
  addToken?: any;
  createMnemonic: any;
  showAddressBook: any;
  classes: any;
  t: any;
}

export function Header (props: IHeaderProps & WithTranslation) {
  const {
      generate, importJson, importLedger, importPrivateKey, importMnemonic, addToken, createMnemonic, showAddressBook
    } = props;
  const { t, classes } = props;
  return (
      <div className={classes.header}>
        <div>
          <span className={classes.title}>{t('accounts.list.title')}</span>
        </div>
        <Menu
          generate={generate}
          importJson={importJson}
          importLedger={importLedger}
          importPrivateKey={importPrivateKey}
          importMnemonic={importMnemonic}
          createMnemonic={createMnemonic}
          addressBook={showAddressBook}
          addToken={addToken}
          t={t}
        />
      </div>
  );
}

const StyledHeader = withStyles(styles)(Header);

export default withTranslation()(
  connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
      generate: () => {
        dispatch(gotoScreen('generate'));
      },
      createMnemonic: () => {
        dispatch(gotoScreen('new-mnemonic'));
      },
      importJson: () => {
        dispatch(gotoScreen('importjson'));
      },
      importPrivateKey: () => {
        dispatch(gotoScreen('import-private-key'));
      },
      importLedger: () => {
        dispatch(gotoScreen('add-from-ledger'));
      },
      importMnemonic: () => {
        dispatch(gotoScreen('import-mnemonic'));
      },
      showAddressBook: () => {
        dispatch(gotoScreen('address-book'));
      },
      addToken: () => {
        dispatch(showDialog('tokens'));
      }
    })
  )(StyledHeader)
);
