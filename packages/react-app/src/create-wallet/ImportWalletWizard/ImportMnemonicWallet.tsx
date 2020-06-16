import { ButtonGroup, Input, Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { accounts, IState, screen } from '@emeraldwallet/store';
import { Button, FormRow, PasswordInput } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

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
  onImport?: any;
  classes: any;
}

export const ImportMnemonicWallet = (props: IProps) => {
  const { classes } = props;
  const [password, setPassword] = React.useState();
  const [errorText, setErrorText] = React.useState<string | null>('');
  const [mnemonic, setMnemonic] = React.useState();

  function handleCancelClick () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function handleImportClick () {
    if (props.onImport) {
      props.onImport(mnemonic, password);
    }
  }

  function handlePasswordChange (newPwd: any) {
    setPassword(newPwd);
  }

  function handleMnemonicChange (event: any) {
    setMnemonic(event.target.value);
  }

  const isValid = (password?.length > 0) && (mnemonic?.length > 0);

  return (
    <Page
      title={'Import wallet - Recovery phrase'}
      leftIcon={<Back onClick={handleCancelClick}/>}
    >
      <FormRow
        rightColumn={(
          <div>Wallets allow you to organize your funds into categories, like spending or savings.</div>
        )}
      />
      <FormRow
        rightColumn={(
          <div style={{ width: '100%' }}>
            <div>Mnemonic phrase</div>
            <div>Typically 24 words phrase separated by space</div>
            <div>
              <Input
                onChange={handleMnemonicChange}
                value={mnemonic}
                multiline={true}
                rowsMax={4}
                rows={4}
              />
            </div>
          </div>
        )}
      />

      <FormRow
        rightColumn={(
          <div style={{ width: '100%' }}>
            <div className={classes.passwordLabel}>Enter a strong password</div>
            <div className={classes.passwordSubLabel}>This password will be required to confirm all wallet operations.
            </div>
            <div style={{ marginTop: '30px' }}>
              <PasswordInput
                password={password}
                onChange={handlePasswordChange}
              />
            </div>
          </div>
        )}
      />
      <FormRow
        rightColumn={(
          <ButtonGroup>
            <Button
              label={'Cancel'}
              onClick={handleCancelClick}
            />
            <Button
              label={'Import'}
              primary={true}
              disabled={!isValid}
              onClick={handleImportClick}
            />
          </ButtonGroup>
        )}
      />
    </Page>
  );
};

const Styled = withStyles(styles)(ImportMnemonicWallet);

export default connect<any, any, any, IState>(
  null,
  (dispatch, ownProps) => ({
    onCancel: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.IMPORT_WALLET));
    },
    onImport: (mnemonic: string, password: string) => {
      dispatch(accounts.actions.importSeedWalletAction(mnemonic, password));
    }

  })
)(Styled);
