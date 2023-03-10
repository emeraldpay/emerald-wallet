import { UnsignedBitcoinTx, Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode } from '@emeraldwallet/core';
import { IState, accounts, transaction } from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import TxSummary from './TxSummary';
import UnlockSeed from '../../create-account/UnlockSeed';
import WaitLedger from '../../ledger/WaitLedger';

interface OwnProps {
  blockchain: BlockchainCode;
  entryId: Uuid;
  seedId: Uuid;
  tx: UnsignedBitcoinTx;
  onSign(txId: string, raw: string): void;
}

interface StateProps {
  isHardware: boolean;
}

interface DispatchProps {
  sign(password?: string): void;
}

const Sign: React.FC<OwnProps & StateProps & DispatchProps> = ({ blockchain, isHardware, seedId, tx, sign }) => (
  <>
    <TxSummary blockchain={blockchain} tx={tx} />
    {isHardware ? (
      <WaitLedger blockchain={blockchain} onConnected={() => sign()} />
    ) : (
      <UnlockSeed seedId={seedId} onUnlock={sign} />
    )}
  </>
);

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { seedId }) => ({
    isHardware: accounts.selectors.isHardwareSeed(state, { type: 'id', value: seedId }),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { entryId, tx, onSign }) => ({
    sign(password?: string) {
      dispatch(
        transaction.actions.signBitcoinTransaction(entryId, tx, password, (txId, raw) => {
          if (txId != null && raw != null) {
            onSign(txId, raw);
          }
        }),
      );
    },
  }),
)(Sign);
