import { Wei } from '@emeraldpay/bigamount-crypto';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  EthereumReceipt,
  EthereumTransaction,
  EthereumTransactionType,
  PersistentState,
  blockchainById,
  blockchainIdToCode,
  formatAmount,
  isEthereum,
} from '@emeraldwallet/core';
import { IState, StoredTransaction, blockchains, screen, transaction, txhistory } from '@emeraldwallet/store';
import { Address, Back, Balance, Button, ButtonGroup, FormLabel, FormRow, Page } from '@emeraldwallet/ui';
import { TextField, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import StoredTxView from '../../transaction/StoredTxView/StoredTxView';

const { ChangeType, Direction, State, Status } = PersistentState;
const { gotoScreen, gotoWalletsScreen } = screen.actions;

const useStyles = makeStyles(
  createStyles({
    address: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

type EnsLookup = { address: string; name: string };

interface OwnProps {
  entryId: EntryId | undefined;
  tx?: StoredTransaction;
}

interface StateProps {
  transaction?: StoredTransaction;
}

interface DispatchProps {
  getEthReceipt(tx: StoredTransaction): Promise<EthereumReceipt | null>;
  getEthTx(tx: StoredTransaction): Promise<EthereumTransaction | null>;
  goBack(): void;
  goToCancelTx(entryId: string | undefined, tx: StoredTransaction): void;
  goToDashboard(): void;
  goToReceipt(tx: StoredTransaction): void;
  goToSpeedUpTx(entryId: string | undefined, tx: StoredTransaction): void;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

const TxDetails: React.FC<OwnProps & StateProps & DispatchProps> = ({
  entryId,
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
  const styles = useStyles();

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
        .filter((change) => change.type !== ChangeType.FEE)
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
          <StoredTxView status={txStatus} tx={transaction} />
          <FormRow>
            <FormLabel>Block</FormLabel>
            <Typography>{transaction.block?.height ?? 'Pending'}</Typography>
          </FormRow>
          {txChanges.length > 0 && (
            <>
              <br />
              {txChanges.map((change, index) => {
                const name = change.address == null ? undefined : nameByAddress[change.address];

                return (
                  <FormRow key={`${change.address}-${index}`}>
                    {txChanges[index - 1]?.direction === change.direction ? (
                      <FormLabel />
                    ) : (
                      <FormLabel top={0}>{change.direction === Direction.EARN ? 'To' : 'From'}</FormLabel>
                    )}
                    <>
                      <div className={styles.address}>
                        <Address address={change.address ?? 'Unknown address'} disableCopy={change.address == null} />
                        {name != null && <Address address={name} />}
                      </div>
                      <Balance balance={change.amountValue} decimals={6} />
                    </>
                  </FormRow>
                );
              })}
            </>
          )}
          <br />
          {txFee != null && (
            <FormRow>
              <FormLabel>Transaction Fee</FormLabel>
              <Typography>{formatAmount(txFee)}</Typography>
            </FormRow>
          )}
          {ethTx != null && (
            <>
              {ethTx.gasPrice != null && (
                <FormRow>
                  <FormLabel>Gas Price</FormLabel>
                  <Typography>{formatAmount(new Wei(ethTx.gasPrice))}</Typography>
                </FormRow>
              )}
              {ethTx.type === EthereumTransactionType.EIP1559 && (
                <>
                  <FormRow>
                    <FormLabel>Max Gas Price</FormLabel>
                    <Typography>{formatAmount(new Wei(ethTx.maxGasPrice ?? 0))}</Typography>
                  </FormRow>
                  <FormRow>
                    <FormLabel>Priority Gas Price</FormLabel>
                    <Typography>{formatAmount(new Wei(ethTx.priorityGasPrice ?? 0))}</Typography>
                  </FormRow>
                </>
              )}
              <FormRow>
                <FormLabel>Nonce</FormLabel>
                <Typography>{ethTx.nonce}</Typography>
              </FormRow>
              <FormRow>
                <FormLabel top>Input Data</FormLabel>
                <TextField disabled fullWidth multiline maxRows={5} minRows={5} value={ethTx.data} />
              </FormRow>
            </>
          )}
          {transaction.state < State.CONFIRMED && (
            <FormRow>
              <FormLabel>Modify</FormLabel>
              <ButtonGroup>
                <Button onClick={() => goToCancelTx(entryId, transaction)} label="Revoke Transaction" />
                <Button onClick={() => goToSpeedUpTx(entryId, transaction)} label="Speed Up" />
              </ButtonGroup>
            </FormRow>
          )}
          <FormRow last>
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button onClick={goToDashboard} label="Dashboard" />
              <Button onClick={() => goToReceipt(transaction)} primary={true} label="Open Receipt" />
            </ButtonGroup>
          </FormRow>
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
    goToCancelTx(entryId, tx) {
      dispatch(gotoScreen(screen.Pages.CREATE_TX_CANCEL, { entryId, tx }, null, true));
    },
    goToDashboard() {
      dispatch(gotoWalletsScreen());
    },
    goToReceipt(tx) {
      dispatch(screen.actions.openTxReceipt(tx.txId));
    },
    goToSpeedUpTx(entryId, tx) {
      dispatch(gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, { entryId, tx }, null, true));
    },
    lookupAddress(blockchain, address) {
      return dispatch(blockchains.actions.lookupAddress(blockchain, address));
    },
  }),
)(TxDetails);
