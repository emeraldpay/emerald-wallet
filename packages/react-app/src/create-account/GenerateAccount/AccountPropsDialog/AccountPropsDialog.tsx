import { ButtonGroup, Input, Page } from '@emeraldplatform/ui';
import { Button, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';

interface IProps {
  onSave?: any;
  onSkip?: any;
}

function AccountPropsDialog (props: IProps) {
  const [name, setName] = React.useState();
  const { onSkip } = props;

  function handleSave () {
    const { onSave } = props;
    if (onSave) {
      onSave(name);
    }
  }

  function handleNameChange (event: any) {
    setName(event.target.value);
  }

  return (
    <Page title='Set account properties'>
      <FormRow
        leftColumn={<div style={{ fontSize: '16px', textAlign: 'right' }}>Wallet name</div>}
        rightColumn={(
          <div style={{ width: '100%' }}>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder='if needed'
            />
          </div>
        )}
      />
      <FormRow
        rightColumn={(
          <ButtonGroup>
            <Button
              primary={true}
              onClick={handleSave}
              label='Save'
            />
            <Button
              variant='text'
              onClick={onSkip}
              label='Skip'
            />
          </ButtonGroup>
        )}
      />
    </Page>
  );
}

export default AccountPropsDialog;
