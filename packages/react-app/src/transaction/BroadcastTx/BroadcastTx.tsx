import { BigAmount } from '@emeraldpay/bigamount';
import {
  Blockchains,
  EthereumTx,
  MAX_DISPLAY_ALLOWANCE,
  TokenRegistry,
  amountFactory,
  decodeData,
  formatAmountPartial,
  toNumber,
} from '@emeraldwallet/core';
import { BroadcastData, IState, screen, transaction } from '@emeraldwallet/store';
import { Account, Button, ButtonGroup, FormLabel, FormRow, Page } from '@emeraldwallet/ui';
import { TextField, Typography, WithStyles, createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';

export const styles = createStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
  label: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  },
});

interface OwnProps {
  data: BroadcastData;
}

interface StateProps {
  tokenRegistry: TokenRegistry;
}

interface DispatchProps {
  onCancel(): void;
  onSendTx(data: BroadcastData): void;
}

class BroadcastTx extends React.Component<OwnProps & StateProps & DispatchProps & WithStyles<typeof styles>> {
  public render(): React.ReactElement {
    const {
      classes,
      data: { blockchain, signed },
      tokenRegistry,
    } = this.props;

    const factory = amountFactory(blockchain);

    const { chainId, code } = Blockchains[blockchain].params;

    const decoded = EthereumTx.fromRaw(signed, chainId);
    const data = decoded.getData();

    let amount: BigAmount = factory(toNumber(decoded.getValue()));
    let to = decoded.getRecipientAddress().toString();

    let method: string | undefined;

    if (data.length > 0) {
      const decodedData = decodeData(data);

      method = decodedData.name;

      if (decodedData.inputs.length > 1 && tokenRegistry.hasAddress(code, to)) {
        const [dataTo, dataAmount] = decodedData.inputs;

        const tokenData = tokenRegistry.byAddress(code, to);

        amount = tokenData.getAmount(dataAmount);
        to = dataTo.toString(16);
      }
    }

    const [amountValue, amountUnit] = formatAmountPartial(amount);

    return (
      <Page title={<ChainTitle blockchain={blockchain} title="Publish Transaction" />}>
        <FormRow>
          <FormLabel>From</FormLabel>
          <Account identity={true} address={decoded.getSenderAddress().toString()} />
        </FormRow>
        <FormRow>
          <FormLabel>To</FormLabel>
          <Account identity={true} address={to} />
        </FormRow>
        <FormRow>
          <FormLabel>{method === 'approve' ? 'Approving' : 'Amount'}</FormLabel>
          <Typography>
            <span data-testid="amount">
              {amount.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE) ? <>&infin;</> : amountValue} {amountUnit}
            </span>
          </Typography>
        </FormRow>
        <FormRow>
          <FormLabel>Nonce</FormLabel>
          <Typography>
            <span data-testid="nonce">{decoded.getNonce()}</span>
          </Typography>
        </FormRow>
        <FormRow>
          <FormLabel top>Raw Tx</FormLabel>
          <TextField disabled fullWidth multiline maxRows={7} minRows={7} value={signed} />
        </FormRow>
        <FormRow last>
          <ButtonGroup classes={{ container: classes.buttons }}>
            <Button label="Cancel" onClick={this.handleCancelClick} />
            <Button primary label="Send" onClick={this.handleSendClick} />
          </ButtonGroup>
        </FormRow>
      </Page>
    );
  }

  private handleCancelClick = (): void => {
    this.props.onCancel();
  };

  private handleSendClick = (): void => {
    this.props.onSendTx(this.props.data);
  };
}

export default connect<StateProps, DispatchProps, unknown, IState>(
  (state) => ({
    tokenRegistry: new TokenRegistry(state.application.tokens),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    onCancel() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
    onSendTx(data) {
      dispatch(transaction.actions.broadcastTx(data));
    },
  }),
)(withStyles(styles)(BroadcastTx));
