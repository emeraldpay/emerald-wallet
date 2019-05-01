import * as React from 'react';
import {Page, ButtonGroup, Input} from '@emeraldplatform/ui';

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
  state = {} as State;

  handleSave = () => {
    const {onSave} = this.props;
    if (onSave) {
      onSave(this.state.name);
    }
  };

  handleNameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  render() {
    const {onSkip} = this.props;
    const {name} = this.state;

    return (
      <Page title="Set account properties">
        <FormRow
          leftColumn={<div style={{fontSize: '16px', textAlign: 'right'}}>Account name</div>}
          rightColumn={
            <div style={{width: '100%'}}>
              <Input
                value={name}
                onChange={this.handleNameChange}
                placeholder="if needed"
              />
            </div>}
        />
        <FormRow
          rightColumn={
            <ButtonGroup>
              <Button
                primary
                onClick={this.handleSave}
                label="Save"
              />
              <Button
                variant="text"
                onClick={onSkip}
                label="Skip"
              />
            </ButtonGroup>
          }
        />
      </Page>
    );
  }
}

export default AccountPropsDialog;
