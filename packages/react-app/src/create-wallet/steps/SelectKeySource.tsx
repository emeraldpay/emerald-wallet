import * as vault from '@emeraldpay/emerald-vault-core';
import { Ledger } from '@emeraldwallet/ui';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import PublishIcon from '@mui/icons-material/Publish';
import * as React from 'react';
import { KeySourceType, KeysSource } from '../flow/types';

type OwnProps = {
  seeds: vault.SeedDescription[];
  onSelect: (value: KeysSource) => void;
};

const SelectKeySource: React.FC<OwnProps> = ({ seeds, onSelect }) => {
  return (
    <List>
      {seeds.map((seed) => {
        if (seed.id == null) {
          return null;
        }

        let label = `Seed ${seed.id}`;

        if (seed.label != null && seed.label.length > 0) {
          label = seed.label;
        } else if (seed.type === 'ledger') {
          label = 'Current Ledger Nano';
        }

        let keySource: KeysSource = {
          type: KeySourceType.SEED_SELECTED,
          id: seed.id,
        };

        if (seed.type === 'ledger') {
          keySource = {
            type: KeySourceType.LEDGER,
            id: seed.id,
          };
        }

        return (
          <ListItem key={`seed-${seed.id}`} onClick={() => onSelect(keySource)} button>
            <ListItemIcon>
              <FileCopyIcon />
            </ListItemIcon>
            <ListItemText primary="Seed" secondary={label} />
          </ListItem>
        );
      })}
      <ListItem button onClick={() => onSelect('start-ledger')}>
        <ListItemIcon>
          <Ledger />
        </ListItemIcon>
        <ListItemText
          primary="Create with Ledger Nano"
          secondary="Connect and set up your Ledger Nano S or X to manage your wallet." />
      </ListItem>
      <ListItem button onClick={() => onSelect({ type: KeySourceType.SEED_GENERATE })}>
        <ListItemIcon>
          <AddBoxIcon />
        </ListItemIcon>
        <ListItemText
          primary="Generate New Seed Phrase"
          secondary="Set up a new wallet by creating a 24-word seed phrase."
        />
      </ListItem>
      <ListItem button onClick={() => onSelect({ type: KeySourceType.SEED_IMPORT })}>
        <ListItemIcon>
          <PublishIcon />
        </ListItemIcon>
        <ListItemText
          primary="Import Seed Phrase"
          secondary="Use an existing 24-word seed phrase to restore a wallet."
        />
      </ListItem>
      <ListItem button onClick={() => onSelect({ type: KeySourceType.PK_RAW, password: '', pk: '' })}>
        <ListItemIcon>
          <PublishIcon />
        </ListItemIcon>
        <ListItemText
          primary="Import Private Key"
          secondary="Input a private key directly to access a single wallet."
        />
      </ListItem>
      <ListItem
        button
        onClick={() => onSelect({ type: KeySourceType.PK_WEB3_JSON, json: '', jsonPassword: '', password: '' })}
      >
        <ListItemIcon>
          <PublishIcon />
        </ListItemIcon>
        <ListItemText
          primary="Import Private Key File"
          secondary="Upload an Ethereum JSON file to access a single wallet."
        />
      </ListItem>
    </List>
  );
};

export default SelectKeySource;
