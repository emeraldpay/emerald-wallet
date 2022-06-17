import { EntryId, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { BitcoinEntry, isSeedPkRef, UnsignedBitcoinTx, Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { BalanceUtxo, BlockchainCode, blockchainIdToCode } from '@emeraldwallet/core';
import { CreateBitcoinTx } from '@emeraldwallet/core/lib/workflow';
import { accounts, FeePrices, IState, screen, transaction } from '@emeraldwallet/store';
import { Back, Page } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import Confirm from './Confirm';
import SetupTx from './SetupTx';
import Sign from './Sign';

type Step = 'setup' | 'sign' | 'result';

interface OwnProps {
  source: EntryId;
}

interface StateProps {
  blockchain: BlockchainCode;
  entry: BitcoinEntry;
  seedId: Uuid;
  utxo: BalanceUtxo[];
}

interface DispatchProps {
  getFees: (blockchain: BlockchainCode) => () => Promise<FeePrices>;
  onBroadcast: (blockchain: BlockchainCode, orig: UnsignedBitcoinTx, raw: string) => void;
  onCancel?: () => void;
}

const Component: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchain,
  entry,
  seedId,
  source,
  utxo,
  getFees,
  onBroadcast,
  onCancel,
}) => {
  const [page, setPage] = React.useState<Step>('setup');
  const [raw, setRaw] = React.useState('');

  const [tx, setTx] = React.useState<UnsignedBitcoinTx | null>(null);
  const [txBuilder, setTxBuilder] = React.useState<CreateBitcoinTx | null>(null);

  React.useEffect(() => {
    try {
      // make sure we setup the Tx Builder only once, otherwise it loses configuration options
      const txBuilder = new CreateBitcoinTx(entry, utxo);

      setTxBuilder(txBuilder);
    } catch (exception) {
      // Nothing
    }
  }, [entry.id]);

  let content;

  if (page == 'setup') {
    if (txBuilder != null) {
      content = (
        <SetupTx
          create={txBuilder}
          entry={entry}
          source={source}
          getFees={getFees(blockchain)}
          onCreate={(tx) => {
            setTx(tx);
            setPage('sign');
          }}
        />
      );
    } else {
      content = <Typography>Initializing...</Typography>;
    }
  } else if (page == 'sign' && typeof tx == 'object' && tx != null) {
    content = (
      <Sign
        blockchain={blockchain}
        entryId={source}
        seedId={seedId}
        tx={tx}
        onSign={(raw) => {
          setRaw(raw);
          setPage('result');
        }}
      />
    );
  } else if (page == 'result') {
    if (tx != null) {
      content = (
        <Confirm
          blockchain={blockchain}
          entryId={entry.id}
          rawtx={raw}
          onConfirm={() => onBroadcast(blockchain, tx, raw)}
        />
      );
    }
  } else {
    console.error('Invalid state', page);

    content = <Alert severity="error">Invalid state</Alert>;
  }

  return (
    <Page title={'Create Bitcoin Transaction'} leftIcon={<Back onClick={onCancel} />}>
      {content}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const entry = accounts.selectors.findEntry(state, ownProps.source);

    if (entry == null) {
      throw new Error('Entry not found: ' + ownProps.source);
    }

    if (!isBitcoinEntry(entry)) {
      throw new Error('Not bitcoin type of entry: ' + entry.id + ' (as ' + entry.blockchain + ')');
    }

    if (!isSeedPkRef(entry, entry.key)) {
      throw new Error('Not a seed entry');
    }

    const utxo = accounts.selectors.getUtxo(state, entry.id);

    return {
      entry,
      utxo,
      blockchain: blockchainIdToCode(entry.blockchain),
      seedId: entry.key.seedId,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => {
    return {
      getFees: (blockchain) => async () => {
        const [avgLast, avgMiddle, avgTail5] = await Promise.all([
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgLast')),
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgMiddle')),
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgTail5')),
        ]);

        return {
          avgLast,
          avgMiddle,
          avgTail5,
        };
      },
      onBroadcast: (blockchain, orig, raw) => {
        dispatch(transaction.actions.broadcastTx(blockchain, raw));

        // when a change output was used
        if (orig.outputs.length > 1) {
          dispatch(accounts.actions.nextAddress(ownProps.source, 'change'));
        }
      },
      onCancel: () => dispatch(screen.actions.gotoWalletsScreen()),
    };
  },
)(Component);
