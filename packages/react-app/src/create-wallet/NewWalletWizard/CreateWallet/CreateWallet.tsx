import { ButtonGroup, Input, Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button } from '@emeraldwallet/ui';
import * as React from 'react';

export interface ICreateWalletProps {
  onCancel?: any;
  onCreate?: any;
}

export const CreateWallet = (props: ICreateWalletProps) => {

  const [name, setName] = React.useState<string>('');
  const [errorText, setErrorText] = React.useState<string | null>(null);

  function handleCancelClick () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function handleCreateClick () {
    if (props.onCreate) {
      props.onCreate(name);
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

  return (
    <Page
      title={'New Wallet - Set name'}
      leftIcon={<Back onClick={handleCancelClick}/>}
    >
      <div>Wallets allow you to organize your funds into categories, like spending or savings.</div>
      <Input
        type='string'
        // containerStyle={this.inputStyles}
        value={name}
        onChange={handleNameChange}
        errorText={errorText}
      />
      <ButtonGroup>
        <Button label={'Cancel'} onClick={handleCancelClick}/>
        <Button
          label={'Continue'}
          primary={true}
          disabled={errorText !== null}
          onClick={handleCreateClick}
        />
      </ButtonGroup>
    </Page>
  );
};

export default CreateWallet;
