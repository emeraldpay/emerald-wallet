import { ButtonGroup, Page } from '@emeraldplatform/ui';
import { addresses, screen } from '@emeraldwallet/store';
import { Button, FormRow } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';

interface IBroadcastTxViewProps {
  tx: any;
  signed: any;
  onSendTx: any;
  onCancel: any;
}

class BroadcastTxView extends React.Component<IBroadcastTxViewProps> {

  public render () {
    return (
      <Page title='Publish Transaction'>
        <FormRow
          rightColumn={<textarea readOnly={true} value={JSON.stringify(this.props.tx)}/>}
        />
        <FormRow
          rightColumn={<textarea readOnly={true} value={this.props.signed} />}
        />
        <FormRow
          rightColumn={(
              <ButtonGroup>
                <Button label={'Cancel'} onClick={this.handleCancelClick} />
                <Button label={'Send'} primary={true} onClick={this.handleSendClick} />
              </ButtonGroup>
          )}
        />
      </Page>
    );
  }
  private handleCancelClick = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }
  private handleSendClick = () => {
    if (this.props.onSendTx) {
      const { tx, signed } = this.props;
      this.props.onSendTx(tx, signed);
    }
  }
}

export default connect(
  (state: any, ownProps: any) => {
    return {

    };
  },

  (dispatch: any, ownProps: any) => ({
    onSendTx: (tx: any, signed: any) => {
      dispatch(addresses.actions.broadcastTx(tx.blockchain, tx, signed));
    },
    onCancel: () => {
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(BroadcastTxView);
