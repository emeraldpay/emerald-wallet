import { BlockchainCode, EthereumAddress } from '@emeraldwallet/core';
import { IdentityIcon } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },
    content: {
      color: theme.palette.text.secondary,
      lineHeight: '1',
      minHeight: '1rem',
      paddingTop: 10,
    },
  }),
);

interface OwnProps {
  address?: string;
  blockchain: BlockchainCode;
  lookupAddress(blockchain: BlockchainCode, address: string): Promise<string | null>;
}

export const AddressPreview: React.FC<OwnProps> = ({ address = '', blockchain, lookupAddress }) => {
  const styles = useStyles();

  const [name, setName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (EthereumAddress.isValid(address)) {
      lookupAddress(blockchain, address).then(setName);
    }
  }, [address, blockchain, lookupAddress]);

  return (
    <div className={styles.container}>
      <IdentityIcon size={50} id={address} />
      <div className={styles.content}>{address}</div>
      <div className={styles.content}>{name}</div>
    </div>
  );
};
