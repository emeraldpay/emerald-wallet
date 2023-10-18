import { BitcoinEntry, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { amountFactory, blockchainIdToCode, formatAmount } from '@emeraldwallet/core';
import { Address, BlockchainAvatar } from '@emeraldwallet/ui';
import { Box, Grid, Typography } from '@material-ui/core';
import * as React from 'react';

interface OwnProps {
  entry: BitcoinEntry;
  unsigned: UnsignedBitcoinTx;
}

const Summary: React.FC<OwnProps> = ({ entry, unsigned: { outputs } }) => {
  const blockchain = blockchainIdToCode(entry.blockchain);

  if (outputs.length === 0 || outputs.length > 2) {
    return null;
  }

  const [{ amount, address }] = outputs;

  return (
    <Box mb={2}>
      <Grid container alignItems="center">
        <Grid item>
          <Box pr={2}>
            <BlockchainAvatar blockchain={blockchain} />
          </Box>
        </Grid>
        <Grid item>
          <Typography variant="h5">Sending {formatAmount(amountFactory(blockchain)(amount))} to:</Typography>
          <Address address={address} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Summary;
