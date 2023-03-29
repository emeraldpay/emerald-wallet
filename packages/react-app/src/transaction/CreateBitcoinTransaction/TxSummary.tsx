import { UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, amountFactory } from '@emeraldwallet/core';
import { Address, CoinAvatar } from '@emeraldwallet/ui';
import { Box, Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
  createStyles({
    icon: {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
    },
  }),
);

interface OwnProps {
  blockchain: BlockchainCode;
  tx: UnsignedBitcoinTx;
}

const TxSummary: React.FC<OwnProps> = ({ blockchain, tx: { outputs } }) => {
  const styles = useStyles();

  if (outputs.length === 0 || outputs.length > 2) {
    return <></>;
  }

  const amountCreate = amountFactory(blockchain);

  const [{ amount, address }] = outputs;

  return (
    <Box mb={1}>
      <Grid container>
        <Grid item xs={1}>
          <div className={styles.icon}>
            <CoinAvatar center blockchain={blockchain} />
          </div>
        </Grid>
        <Grid item xs={11}>
          <Typography variant="h5">Sending {amountCreate(amount).toString()} to:</Typography>
          <Address address={address} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default TxSummary;
