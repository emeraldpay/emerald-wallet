import { Address, Button, FormLabel, FormRow } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import { blue as blueColors } from '@material-ui/core/colors';
import * as React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    address: {
      marginBottom: theme.spacing(),
    },
    counter: {
      backgroundColor: blueColors[500],
      borderRadius: '50%',
      color: 'white',
      display: 'inline-block',
      fontSize: '11px !important',
      lineHeight: '20px',
      height: 20,
      width: 20,
    },
  }),
);

interface OwnProps {
  inputs: Array<{ address?: string }>;
}

export const BitcoinAddresses: React.FC<OwnProps> = ({ inputs }) => {
  const styles = useStyles();

  const [expanded, setExpanded] = React.useState(false);

  const addresses = inputs.reduce<string[]>(
    (carry, { address }) => (address == null || carry.includes(address) ? carry : [...carry, address]),
    [],
  );

  if (addresses.length === 0) {
    return null;
  }

  const [address] = addresses;

  return (
    <FormRow>
      <FormLabel top={addresses.length > 1 ? 0 : false}>From</FormLabel>
      <div>
        {expanded ? (
          <>
            {addresses.map((address) => (
              <Address key={address} address={address} classes={{ root: styles.address }} />
            ))}
            <Button label={`Hide addresses`} variant="text" onClick={() => setExpanded(false)} />
          </>
        ) : (
          <>
            <Address address={address} classes={{ root: styles.address }} />
            {addresses.length > 1 ? (
              <Button
                label={`See all ${addresses.length} addresses`}
                icon={<span className={styles.counter}>{addresses.length}</span>}
                variant="text"
                onClick={() => setExpanded(true)}
              />
            ) : null}
          </>
        )}
      </div>
    </FormRow>
  );
};
