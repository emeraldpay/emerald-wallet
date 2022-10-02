import {
  AddressRole,
  BitcoinEntry,
  CurrentAddress,
  EntryId,
  UnsignedBitcoinTx,
  Uuid,
  isBitcoinEntry,
  isSeedPkRef,
} from '@emeraldpay/emerald-vault-core';
import { BalanceUtxo, BlockchainCode, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import { DefaultFee, FeePrices, IState, accounts, application, screen, transaction } from '@emeraldwallet/store';
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
  defaultFee: DefaultFee;
  entry: BitcoinEntry;
  seedId: Uuid;
  utxo: BalanceUtxo[];
}

interface DispatchProps {
  onBroadcast(blockchain: BlockchainCode, orig: UnsignedBitcoinTx, raw: string): void;
  onCancel?(): void;
  getFees(blockchain: BlockchainCode, defaultFee: DefaultFee): () => Promise<FeePrices<number>>;
  getXPubPositionalAddress(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress>;
}

const Component: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchain,
  defaultFee,
  entry,
  seedId,
  source,
  utxo,
  getFees,
  getXPubPositionalAddress,
  onBroadcast,
  onCancel,
}) => {
  const [page, setPage] = React.useState<Step>('setup');
  const [raw, setRaw] = React.useState('');

  const [tx, setTx] = React.useState<UnsignedBitcoinTx | null>(null);
  const [txBuilder, setTxBuilder] = React.useState<workflow.CreateBitcoinTx | null>(null);

  React.useEffect(
    () => {
      if (isBitcoinEntry(entry)) {
        Promise.all(entry.xpub.map(({ role, xpub }) => getXPubPositionalAddress(entry.id, xpub, role))).then(
          (addresses) => {
            try {
              const txBuilder = new workflow.CreateBitcoinTx(entry, addresses, utxo);

              setTxBuilder(txBuilder);
            } catch (exception) {
              // Nothing
            }
          },
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  let content;

  if (page == 'setup') {
    if (txBuilder != null) {
      content = (
        <SetupTx
          create={txBuilder}
          entry={entry}
          source={source}
          getFees={getFees(blockchain, defaultFee)}
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

    const blockchain = blockchainIdToCode(entry.blockchain);

    return {
      entry,
      blockchain,
      defaultFee: application.selectors.getDefaultFee(state, blockchain),
      seedId: entry.key.seedId,
      utxo: accounts.selectors.getUtxo(state, entry.id),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    getFees(blockchain, defaultFee) {
      return async () => {
        try {
          const fees: number[] = await Promise.all([
            dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgLast')),
            dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgMiddle')),
            dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgTail5')),
          ]);

          const [avgLast, avgMiddle, avgTail5] = fees.sort((first, second) => {
            if (first === second) {
              return 0;
            }

            return first > second ? 1 : -1;
          });

          return {
            avgLast,
            avgMiddle,
            avgTail5,
          };
        } catch (exception) {
          return {
            avgLast: defaultFee.min,
            avgMiddle: defaultFee.max,
            avgTail5: defaultFee.std,
          };
        }
      };
    },
    getXPubPositionalAddress(entryId, xPub, role) {
      return dispatch(accounts.actions.getXPubPositionalAddress(entryId, xPub, role));
    },
    onBroadcast: (blockchain, orig, raw) => {
      dispatch(transaction.actions.broadcastTx(blockchain, raw));

      // when a change output was used
      if (orig.outputs.length > 1) {
        dispatch(accounts.actions.nextAddress(ownProps.source, 'change'));
      }
    },
    onCancel: () => dispatch(screen.actions.gotoWalletsScreen()),
  }),
)(Component);
