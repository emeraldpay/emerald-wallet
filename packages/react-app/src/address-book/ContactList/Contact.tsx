import * as React from 'react';
import EditContact from '../EditContact';
import ShowContact from '../ShowContact';

const States = {
  SHOW: 'SHOW',
  EDIT: 'EDIT'
};

interface State {
  currentState: any;
}

interface Props {
  address: string;
}

class Contact extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      currentState: States.SHOW
    };
  }

  public handleCancelEdit = () => {
    this.setState({
      currentState: States.SHOW
    });
  }

  public handleEditAddress = () => {
    this.setState({
      currentState: States.EDIT
    });
  }

  public render () {
    const { currentState } = this.state;
    if (currentState === States.SHOW) {
      return (<ShowContact onEditAddress={this.handleEditAddress} {...this.props} />);
    }
    return (<EditContact onCancel={this.handleCancelEdit} {...this.props} />);
  }
}

export default Contact;
