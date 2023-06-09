import * as vault from '@emeraldpay/emerald-vault-core';
import { Ledger } from '@emeraldwallet/ui';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PublishIcon from '@material-ui/icons/Publish';
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
        <ListItemText primary="Create from Ledger Nano" secondary="Create wallet backed by Ledger Nano model S or X" />
      </ListItem>
      <ListItem button onClick={() => onSelect({ type: KeySourceType.SEED_GENERATE })}>
        <ListItemIcon>
          <AddBoxIcon />
        </ListItemIcon>
        <ListItemText
          primary="Create new seed"
          secondary="Generate a new mnemonic phrase for a new wallet (24 words)"
        />
      </ListItem>
      <ListItem button onClick={() => onSelect({ type: KeySourceType.SEED_IMPORT })}>
        <ListItemIcon>
          <PublishIcon />
        </ListItemIcon>
        <ListItemText
          primary="Import existing seed"
          secondary="Import another mnemonic phrase or use new Hardware Wallet (Ledger Nano)"
        />
      </ListItem>
      <ListItem button onClick={() => onSelect({ type: KeySourceType.PK_RAW, password: '', pk: '' })}>
        <ListItemIcon>
          <PublishIcon />
        </ListItemIcon>
        <ListItemText
          primary="Import existing Raw Private Key"
          secondary={'Create a new wallet dedicated to a single Private Key, by importing a raw key'}
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
          primary="Import existing Private Key JSON file"
          secondary="Create a new wallet dedicated to a single Private Key, by importing Ethereum JSON file"
        />
      </ListItem>
    </List>
  );
};

export default SelectKeySource;
