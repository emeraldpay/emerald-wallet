import * as React from 'react';
import {ButtonGroup} from "@emeraldplatform/ui";
import Button from '../../../common/Button';


interface Props {
  onCancel?: any;
  onSubmit?: any;
  address: string;
  symbol: string;
  totalSupply: string;
  decimals: any;
}

class AddToken extends React.Component<Props> {

  private handleCancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  private handleSubmit = () => {
    const { onSubmit } = this.props;
    onSubmit && onSubmit();
  };

  render() {
    const { address, symbol, totalSupply, decimals } = this.props;
    return (
      <div>
        <div>
          <table>
            <tbody>
            <tr>
              <td>Address</td>
              <td>{ address }</td>
            </tr>
            <tr>
              <td>Symbol</td>
              <td>{ symbol }</td>
            </tr>
            <tr>
              <td>Total supply</td>
              <td>{ totalSupply }</td>
            </tr>
            <tr>
              <td>Decimals</td>
              <td>{ decimals }</td>
            </tr>
            </tbody>
          </table>
        </div>
        <div style={{marginTop: '10px'}}>
          <ButtonGroup>
            <Button
              primary
              label="Add"
              onClick={ this.handleSubmit }
            />
            <Button
              label="Cancel"
              onClick={ this.handleCancel }
            />
          </ButtonGroup>
        </div>
      </div>
    )
  }
}

export default AddToken;
