import { PersistentState } from '@emeraldwallet/core';
import * as React from 'react';
import EditContact from '../EditContact';
import ShowContact from '../ShowContact';

enum States {
  SHOW = 'SHOW',
  EDIT = 'EDIT',
}

interface OwnProps {
  contact: PersistentState.AddressbookItem;
}

interface StateProps {
  currentState: States;
}

class Contact extends React.Component<OwnProps, StateProps> {
  constructor(props: OwnProps) {
    super(props);

    this.state = { currentState: States.SHOW };
  }

  public handleCancelEdit = (): void => {
    this.setState({ currentState: States.SHOW });
  };

  public handleEditAddress = (): void => {
    this.setState({ currentState: States.EDIT });
  };

  public render(): React.ReactNode {
    const { currentState } = this.state;

    return currentState === States.SHOW ? (
      <ShowContact onEditAddress={this.handleEditAddress} {...this.props} />
    ) : (
      <EditContact onCancel={this.handleCancelEdit} {...this.props} />
    );
  }
}

export default Contact;
