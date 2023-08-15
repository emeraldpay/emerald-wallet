import { PersistentState } from '@emeraldwallet/core';
import { StoredTransaction } from '@emeraldwallet/store';
import { Address, FormLabel, FormRow } from '@emeraldwallet/ui';
import { Typography } from '@material-ui/core';
import * as React from 'react';
import { TxStatus } from '../../transactions/TxDetails/TxStatus';

interface OwnProps {
  status?: PersistentState.Status;
  tx: StoredTransaction;
}

const StoredTxView: React.FC<OwnProps> = ({ status, tx }) => (
  <>
    <FormRow>
      <FormLabel>Date</FormLabel>
      <Typography>{tx.confirmTimestamp?.toUTCString() ?? 'Pending'}</Typography>
    </FormRow>
    <FormRow>
      <FormLabel>Status</FormLabel>
      <TxStatus state={tx.state} status={status ?? tx.status} />
    </FormRow>
    <FormRow>
      <FormLabel>Hash</FormLabel>
      <Address address={tx.txId} />
    </FormRow>
  </>
);

export default StoredTxView;
