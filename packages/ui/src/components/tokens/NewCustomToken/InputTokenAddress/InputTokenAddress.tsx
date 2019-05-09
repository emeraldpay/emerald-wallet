import * as React from 'react';
import {Input, Warning, WarningText} from '@emeraldplatform/ui';

import Button from "../../../common/Button";

interface Props {
  onSubmit?: any;
  error?: string;
}

interface State {
  contractAddress?: string;
}

class InputTokenAddress extends React.Component<Props, State> {
  state: State = {};

  private handleSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit && onSubmit(this.state.contractAddress);
  };

  private handleAddressChange = (event: any) => {
    this.setState({
      contractAddress: event.target.value,
    });
  };

  render() {
    const { contractAddress } = this.state;
    const { error } = this.props;
    return (
      <div>
        <div>
          <Input
            onChange={ this.handleAddressChange }
            placeholder="Token Contract Address"
            type="text"
            value={contractAddress}
          />
        </div>
        {error &&
          <Warning>
            <WarningText>{error}</WarningText>
          </Warning>
        }
        <div style={{marginTop: '10px'}}>
          <Button
            primary
            label="Submit"
            onClick={ this.handleSubmit }
          />
        </div>
      </div>
    );
  }
}

export default InputTokenAddress;
