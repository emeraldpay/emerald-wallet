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
import { BlockchainCode, InputUtxo, blockchainIdToCode, workflow } from '@emeraldwallet/core';
import {
  BroadcastData,
  DefaultFee,
  FeePrices,
  IState,
  accounts,
  application,
  screen,
  transaction,
} from '@emeraldwallet/store';
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
  defaultFee: DefaultFee<number> | undefined;
  entry: BitcoinEntry;
  feeTtl: number;
  seedId: Uuid;
  utxo: InputUtxo[];
}

interface DispatchProps {
  onBroadcast(data: BroadcastData): void;
  onCancel?(): void;
  getFees(
    blockchain: BlockchainCode,
    defaultFee: DefaultFee<number> | undefined,
    feeTtl: number,
  ): () => Promise<FeePrices<number>>;
  getXPubPositionalAddress(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress>;
}

const CreateBitcoinTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchain,
  defaultFee,
  entry,
  feeTtl,
  seedId,
  source,
  utxo,
  getFees,
  getXPubPositionalAddress,
  onBroadcast,
  onCancel,
}) => {
  const [fee, setFee] = React.useState(accounts.selectors.zeroAmountFor(blockchain));
  const [page, setPage] = React.useState<Step>('setup');
  const [signed, setSigned] = React.useState('');
  const [txId, setTxId] = React.useState('');

  const [tx, setTx] = React.useState<UnsignedBitcoinTx | null>(null);
  const [txBuilder, setTxBuilder] = React.useState<workflow.CreateBitcoinTx | null>(null);

  React.useEffect(
    () => {
      if (isBitcoinEntry(entry)) {
        Promise.all(
          entry.xpub
            .filter(({ role }) => role === 'change')
            .map(({ role, xpub }) => getXPubPositionalAddress(entry.id, xpub, role)),
        ).then(([{ address }]) => {
          try {
            const txBuilder = new workflow.CreateBitcoinTx(entry, address, utxo);

            setTxBuilder(txBuilder);
          } catch (exception) {
            // Nothing
          }
        });
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
          getFees={getFees(blockchain, defaultFee, feeTtl)}
          onCreate={(tx, fee) => {
            setFee(fee);
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
        onSign={(txId, signed) => {
          setSigned(signed);
          setTxId(txId);

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
          rawTx={signed}
          onConfirm={() =>
            onBroadcast({
              blockchain,
              fee,
              tx,
              txId,
              signed,
              entryId: entry.id,
            })
          }
        />
      );
    }
  } else {
    console.error('Invalid state', page);

    content = <Alert severity="error">Invalid state</Alert>;
  }

  return (
    <Page title="Create Bitcoin Transaction" leftIcon={<Back onClick={onCancel} />}>
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
      defaultFee: application.selectors.getDefaultFee<number>(state, blockchain),
      feeTtl: application.selectors.getFeeTtl(state, blockchain),
      seedId: entry.key.seedId,
      utxo: accounts.selectors.getUtxo(state, entry.id),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getFees(blockchain, defaultFee, feeTtl) {
      return async () => {
        const fees: number[] = await Promise.all([
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgLast')),
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgMiddle')),
          dispatch(transaction.actions.estimateFee(blockchain, 6, 'avgTail5')),
        ]);

        const [avgLast, avgTail5, avgMiddle] = fees
          .map((fee) => fee ?? 0)
          .sort((first, second) => {
            if (first === second) {
              return 0;
            }

            return first > second ? 1 : -1;
          });

        if (avgMiddle === 0) {
          const defaults = {
            avgLast: defaultFee?.min ?? '0',
            avgMiddle: defaultFee?.max ?? '0',
            avgTail5: defaultFee?.std ?? '0',
          };

          const cachedFee = await dispatch(application.actions.cacheGet(`fee.${blockchain}`));

          if (cachedFee == null) {
            return defaults;
          }

          try {
            return JSON.parse(cachedFee);
          } catch (exception) {
            return defaults;
          }
        }

        const fee = {
          avgLast,
          avgMiddle,
          avgTail5,
        };

        await dispatch(application.actions.cachePut(`fee.${blockchain}`, JSON.stringify(fee), feeTtl));

        return fee;
      };
    },
    getXPubPositionalAddress(entryId, xPub, role) {
      return dispatch(accounts.actions.getXPubPositionalAddress(entryId, xPub, role));
    },
    onBroadcast(data) {
      dispatch(transaction.actions.broadcastTx(data));
    },
    onCancel() {
      dispatch(screen.actions.goBack());
    },
  }),
)(CreateBitcoinTransaction);
