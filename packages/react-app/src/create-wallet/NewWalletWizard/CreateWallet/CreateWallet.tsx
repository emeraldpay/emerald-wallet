import { ButtonGroup, Input, Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button, FormRow, PasswordInput } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/core';
import * as React from 'react';

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

export interface ICreateWalletProps {
  onCancel?: any;
  onCreate?: any;
  classes: any;
}

export const CreateWallet = (props: ICreateWalletProps) => {
  const { classes } = props;
  const [name, setName] = React.useState<string>('');
  const [password, setPassword] = React.useState();
  const [errorText, setErrorText] = React.useState<string | null>('');

  function handleCancelClick () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function handleCreateClick () {
    if (props.onCreate) {
      props.onCreate(name, password);
    }
  }

  function handleNameChange (event: any) {
    const nameValue = event.target.value || '';
    setName(nameValue);
    if (nameValue.length === 0) {
      setErrorText('Required');
    } else {
      setErrorText(null);
    }
  }

  function handlePasswordChange (newPwd: any) {
    setPassword(newPwd);
  }

  const isValid = name?.length > 0 && password?.length > PasswordInput.DEFAULT_MIN_LENGTH;

  return (
    <Page
      title={'New Wallet - Name and password'}
      leftIcon={<Back onClick={handleCancelClick}/>}
    >
      <FormRow
        rightColumn={(
          <div>Wallets allow you to organize your funds into categories, like spending or savings.</div>
        )}
      />
      <FormRow
        rightColumn={(
          <Input
            type='string'
            // containerStyle={this.inputStyles}
            value={name}
            placeholder={'Wallet short name'}
            onChange={handleNameChange}
            errorText={errorText}
          />
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
            <Button label={'Cancel'} onClick={handleCancelClick}/>
            <Button
              label={'Continue'}
              primary={true}
              disabled={!isValid}
              onClick={handleCreateClick}
            />
          </ButtonGroup>
          )}
      />
    </Page>
  );
};

export default withStyles(styles)(CreateWallet);
