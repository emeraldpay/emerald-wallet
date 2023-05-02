import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BitcoinRawTransaction,
  EthereumTransaction,
  blockchainIdToCode,
  isEthereum,
  isEthereumTransaction,
} from '@emeraldwallet/core';
import { IState, StoredTransaction, accounts, screen, transaction, txhistory } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import StoredTxView from '../StoredTxView';
import CancelBitcoinTransaction from './CancelBitcoinTransaction';
import CancelEthereumTransaction from './CancelEthereumTransaction';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  entryId: EntryId | undefined;
  tx: StoredTransaction;
}

interface StateProps {
  isHardware: boolean;
  storedTx: StoredTransaction;
}

interface DispatchProps {
  getBtcTx(tx: StoredTransaction): Promise<BitcoinRawTransaction | null>;
  getEthTx(tx: StoredTransaction): Promise<EthereumTransaction | null>;
  goBack(): void;
}

const CreateCancelTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  entryId,
  isHardware,
  storedTx,
  getBtcTx,
  getEthTx,
  goBack,
}) => {
  const styles = useStyles();

  const [blockchainTx, setBlockchainTx] = React.useState<BitcoinRawTransaction | EthereumTransaction | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (isEthereum(blockchainIdToCode(storedTx.blockchain)) ? getEthTx : getBtcTx)(storedTx).then((value) => {
      if (mounted) {
        setBlockchainTx(value);
      }
    });

    return () => {
      mounted = false;
    };
  }, [storedTx, getBtcTx, getEthTx]);

  return (
    <Page title="Revert Transaction" leftIcon={<Back onClick={goBack} />}>
      {blockchainTx == null ? (
        <>
          <StoredTxView tx={storedTx} />
          <FormRow last>
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
            </ButtonGroup>
          </FormRow>
        </>
      ) : isEthereumTransaction(blockchainTx) ? (
        <CancelEthereumTransaction
          entryId={entryId}
          ethTx={blockchainTx}
          isHardware={isHardware}
          tx={storedTx}
          goBack={goBack}
        />
      ) : (
        <CancelBitcoinTransaction
          entryId={entryId}
          rawTx={blockchainTx}
          isHardware={isHardware}
          tx={storedTx}
          goBack={goBack}
        />
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entryId, tx }) => {
    let isHardware = false;

    if (entryId != null) {
      const wallet = accounts.selectors.findWalletByEntryId(state, entryId);

      if (wallet != null) {
        const [account] = wallet.reserved ?? [];

        if (account != null) {
          isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
        }
      }
    }

    return {
      isHardware,
      storedTx: txhistory.selectors.transactionById(state, tx.txId) ?? tx,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getBtcTx(tx) {
      return dispatch(transaction.actions.getBtcTx(blockchainIdToCode(tx.blockchain), tx.txId));
    },
    getEthTx(tx) {
      return dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
  }),
)(CreateCancelTransaction);
