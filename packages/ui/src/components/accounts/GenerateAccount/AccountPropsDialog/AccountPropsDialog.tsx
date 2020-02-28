import { ButtonGroup, Input, Page } from '@emeraldplatform/ui';
import * as React from 'react';

import Button from '../../../common/Button';
import FormRow from '../../../common/FormRow';

interface Props {
  onSave?: any;
  onSkip?: any;
}

interface State {
  name?: string;
}

class AccountPropsDialog extends React.Component<Props, State> {
  public state = {} as State;

  public handleSave = () => {
    const { onSave } = this.props;
    if (onSave) {
      onSave(this.state.name);
    }
  }

  public handleNameChange = (event) => {
    this.setState({
      name: event.target.value
    });
  }

  public render () {
    const { onSkip } = this.props;
    const { name } = this.state;

    return (
      <Page title='Set account properties'>
        <FormRow
          leftColumn={<div style={{ fontSize: '16px', textAlign: 'right' }}>Account name</div>}
          rightColumn={
            <div style={{ width: '100%' }}>
              <Input
                value={name}
                onChange={this.handleNameChange}
                placeholder='if needed'
              />
            </div>}
        />
        <FormRow
          rightColumn={
            <ButtonGroup>
              <Button
                primary={true}
                onClick={this.handleSave}
                label='Save'
              />
              <Button
                variant='text'
                onClick={onSkip}
                label='Skip'
              />
            </ButtonGroup>
          }
        />
      </Page>
    );
  }
}

export default AccountPropsDialog;
