import { BlockchainCode, EthereumAddress } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { Box, Typography, createStyles, makeStyles } from '@material-ui/core';
import { blue as blueColors } from '@material-ui/core/colors';
import { AccountCircle as AccountIcon } from '@material-ui/icons';
import * as React from 'react';

const useStyles = makeStyles(createStyles({ blue: { color: blueColors[500] } }));

interface OwnProps {
  address: string;
  blockchain: BlockchainCode;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

export const EthereumName: React.FC<OwnProps> = ({ address, blockchain, lookupAddress }) => {
  const styles = useStyles();

  const [name, setName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (EthereumAddress.isValid(address)) {
      lookupAddress(blockchain, address).then(setName);
    }
  }, [address, blockchain, lookupAddress]);

  if (name == null) {
    return null;
  }

  return (
    <FormRow>
      <FormLabel />
      <Box display="flex" alignItems="center">
        <AccountIcon className={styles.blue} />
        <Box ml={1}>
          <Typography color="textPrimary">{name}</Typography>
        </Box>
      </Box>
    </FormRow>
  );
};
