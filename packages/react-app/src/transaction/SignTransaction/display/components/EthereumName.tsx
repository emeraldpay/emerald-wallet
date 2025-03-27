import { BlockchainCode, EthereumAddress } from '@emeraldwallet/core';
import { FormLabel, FormRow } from '@emeraldwallet/ui';
import { Box, Typography, } from '@mui/material';
import { AccountCircle as AccountIcon } from '@mui/icons-material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()((theme) => ({
  blue: { color: theme.palette.info.light }
}));

interface OwnProps {
  address: string;
  blockchain: BlockchainCode;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

export const EthereumName: React.FC<OwnProps> = ({ address, blockchain, lookupAddress }) => {
  const styles = useStyles().classes;

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
