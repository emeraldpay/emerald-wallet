import { Wei } from '@emeraldpay/bigamount-crypto';
import {
  BlockchainCode,
  EthereumReceipt,
  EthereumTransaction,
  PersistentState,
  blockchainById,
  blockchainIdToCode,
  formatAmount,
  isEthereum,
} from '@emeraldwallet/core';
import { IState, StoredTransaction, blockchains, screen, transaction, txhistory } from '@emeraldwallet/store';
import { Address, Back, Balance, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { Typography, createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { TxStatus } from './TxStatus';

const { ChangeType, Direction, State, Status } = PersistentState;
const { gotoScreen, gotoWalletsScreen } = screen.actions;

const styles = createStyles({
  addressField: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  idField: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nameField: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  },
  textField: {
    width: '100%',
  },
});

type EnsLookup = { address: string; name: string };

interface OwnProps {
  tx?: StoredTransaction;
}

interface StateProps {
  transaction?: StoredTransaction;
}

interface DispatchProps {
  getEthReceipt(tx: StoredTransaction): Promise<EthereumReceipt | null>;
  getEthTx(tx: StoredTransaction): Promise<EthereumTransaction | null>;
  goBack(): void;
  goToCancelTx(tx: EthereumTransaction): void;
  goToDashboard(): void;
  goToReceipt(tx: StoredTransaction): void;
  goToSpeedUpTx(tx: EthereumTransaction): void;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const TxDetails: React.FC<OwnProps & StateProps & DispatchProps & StylesProps> = ({
  classes,
  transaction,
  getEthTx,
  getEthReceipt,
  goBack,
  goToCancelTx,
  goToDashboard,
  goToReceipt,
  goToSpeedUpTx,
  lookupAddress,
}) => {
  const [nameByAddress, setNameByAddress] = React.useState<Record<string, string>>({});
  const [ethReceipt, setEthReceipt] = React.useState<EthereumReceipt | null>(null);
  const [ethTx, setEthTx] = React.useState<EthereumTransaction | null>(null);

  const blockchain = React.useMemo(
    () => (transaction == null ? undefined : blockchainById(transaction.blockchain)),
    [transaction],
  );
  const txChanges = React.useMemo(
    () =>
      transaction?.changes
        .filter((change) => change.type !== ChangeType.FEE && change.amountValue.isPositive())
        .sort((first, second) => {
          if (first.direction === second.direction) {
            return 0;
          }

          return first.direction > second.direction ? -1 : 1;
        }) ?? [],
    [transaction],
  );
  const txFee = React.useMemo(
    () => transaction?.changes.find((change) => change.type === ChangeType.FEE)?.amountValue,
    [transaction],
  );
  const txStatus = React.useMemo(
    () => (ethReceipt == null ? transaction?.status : ethReceipt.status === 1 ? Status.OK : Status.FAILED),
    [ethReceipt, transaction],
  );

  React.useEffect(() => {
    if (transaction != null && blockchain != null && isEthereum(blockchain.params.code)) {
      (async () => {
        const results = await Promise.allSettled([getEthReceipt(transaction), getEthTx(transaction)]);

        const [receipt, tx] = results.map((result) => (result.status === 'fulfilled' ? result.value : null)) as [
          EthereumReceipt,
          EthereumTransaction,
        ];

        setEthReceipt(receipt);
        setEthTx(tx);

        const ensLookup: Array<EnsLookup | null> = await Promise.all(
          transaction.changes.map(async ({ address }) => {
            if (address == null) {
              return null;
            }

            const name = await lookupAddress(blockchain.params.code, address);

            if (name == null) {
              return null;
            }

            return { address, name };
          }, []),
        );

        setNameByAddress(
          ensLookup
            .filter((item): item is EnsLookup => item != null)
            .reduce((carry, { address, name }) => ({ ...carry, [address]: name }), {}),
        );
      })();
    }
  }, [blockchain, transaction, getEthReceipt, getEthTx, lookupAddress]);

  return (
    <Page title="Transaction Details" leftIcon={<Back onClick={() => goBack()} />}>
      {transaction == null ? (
        <Typography variant="caption">Transaction not found! Please try again later.</Typography>
      ) : (
        <>
          <FormRow
            leftColumn={<div className={classes.nameField}>Date</div>}
            rightColumn={<Typography>{transaction.confirmTimestamp?.toUTCString() ?? 'Pending'}</Typography>}
          />
          <FormRow
            leftColumn={<div className={classes.nameField}>Status</div>}
            rightColumn={<TxStatus state={transaction.state} status={txStatus} />}
          />
          <FormRow
            leftColumn={<div className={classes.nameField}>Hash</div>}
            rightColumn={
              <Typography className={classes.idField} title={transaction.txId}>
                {transaction.txId}
              </Typography>
            }
          />
          <FormRow
            leftColumn={<div className={classes.nameField}>Block</div>}
            rightColumn={<Typography>{transaction.block?.height ?? 'Pending'}</Typography>}
          />
          {txChanges.length > 0 && (
            <>
              <br />
              {txChanges.map((change, index) => {
                const name = change.address == null ? undefined : nameByAddress[change.address];

                return (
                  <div key={`${change.address}-${index}`}>
                    <FormRow
                      leftColumn={
                        <div className={classes.nameField}>{change.direction === Direction.EARN ? 'To' : 'From'}</div>
                      }
                      rightColumn={
                        <>
                          <div className={classes.addressField}>
                            <Address
                              address={change.address ?? 'Unknown address'}
                              disableCopy={change.address == null}
                            />
                            {name != null && <Address address={name} />}
                          </div>
                          <Balance balance={change.amountValue} />
                        </>
                      }
                    />
                  </div>
                );
              })}
            </>
          )}
          <br />
          {txFee != null && (
            <FormRow
              leftColumn={<div className={classes.nameField}>Transaction Fee</div>}
              rightColumn={<Typography>{formatAmount(txFee)}</Typography>}
            />
          )}
          {ethTx != null && (
            <>
              {ethTx.gasPrice == null ? (
                <>
                  <FormRow
                    leftColumn={<div className={classes.nameField}>Max Gas Price</div>}
                    rightColumn={<Typography>{formatAmount(new Wei(ethTx.maxGasPrice ?? 0))}</Typography>}
                  />
                  <FormRow
                    leftColumn={<div className={classes.nameField}>Priority Gas Price</div>}
                    rightColumn={<Typography>{formatAmount(new Wei(ethTx.priorityGasPrice ?? 0))}</Typography>}
                  />
                </>
              ) : (
                <FormRow
                  leftColumn={<div className={classes.nameField}>Gas Price</div>}
                  rightColumn={<Typography>{formatAmount(new Wei(ethTx.gasPrice))}</Typography>}
                />
              )}
              <FormRow
                leftColumn={<div className={classes.nameField}>Nonce</div>}
                rightColumn={<Typography>{ethTx.nonce}</Typography>}
              />
              <FormRow
                leftColumn={<div className={classes.nameField}>Input Data</div>}
                rightColumn={<textarea className={classes.textField} readOnly={true} rows={5} value={ethTx.data} />}
              />
              {transaction.state < State.CONFIRMED && (
                <FormRow
                  leftColumn={<div className={classes.nameField}>Modify</div>}
                  rightColumn={
                    <ButtonGroup>
                      <Button onClick={() => goToSpeedUpTx(ethTx)} label="SPEED UP" />
                      <Button onClick={() => goToCancelTx(ethTx)} label="CANCEL TRANSACTION" />
                    </ButtonGroup>
                  }
                />
              )}
            </>
          )}
          <FormRow
            rightColumn={
              <ButtonGroup>
                <Button onClick={goToDashboard} label="DASHBOARD" />
                <Button onClick={() => goToReceipt(transaction)} primary={true} label="OPEN RECEIPT" />
              </ButtonGroup>
            }
          />
        </>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { tx }) => ({
    transaction: tx == null ? undefined : txhistory.selectors.transactionById(state, tx.txId) ?? tx,
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getEthReceipt(tx) {
      return dispatch(transaction.actions.getEthReceipt(blockchainIdToCode(tx.blockchain), tx.txId));
    },
    getEthTx(tx) {
      return dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    goToCancelTx(tx) {
      dispatch(gotoScreen(screen.Pages.CREATE_TX_CANCEL, tx, null, true));
    },
    goToDashboard() {
      dispatch(gotoWalletsScreen());
    },
    goToReceipt(tx) {
      dispatch(screen.actions.openTxReceipt(tx.txId));
    },
    goToSpeedUpTx(tx) {
      dispatch(gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, tx, null, true));
    },
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
  }),
)(withStyles(styles)(TxDetails));
