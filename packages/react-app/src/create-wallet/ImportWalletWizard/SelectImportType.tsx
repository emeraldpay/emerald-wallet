import {
  Download as DownloadIcon,
  Key as KeyIcon,
  Keypair as KeypairIcon,
  Ledger as LedgerIcon
} from '@emeraldplatform/ui-icons';
import { addAccount, IState } from '@emeraldwallet/store';
import {
  Avatar,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import { AccountBalanceWalletOutlined as WalletIcon } from '@material-ui/icons';
import * as React from 'react';

export enum ImportTypes {
  ImportSeedWallet = 0,
  ImportPrivateKey = 1,
  ImportJSON = 2,
  GeneratePK = 3
}

const supportedTypes: any[] = [
  {
    code: ImportTypes.ImportSeedWallet,
    title: 'Import wallet',
    description: 'Recover multi-currency wallet from mnemonic phrase'
  },
  {
    code: ImportTypes.ImportPrivateKey,
    title: 'Import Private Key',
    description: 'Import an existing raw unencrypted Private Key'
  },
  {
    code: ImportTypes.ImportJSON,
    title: 'Import JSON',
    description: 'Import existing Private Key from JSON file'
  },
  {
    code: ImportTypes.GeneratePK,
    title: 'Generate Private Key',
    description: 'Generate a new Private Key'
  },
];

interface IRenderProps {
  onSelect?: any;
}

function icon (type: ImportTypes): JSX.Element {
  if (type === ImportTypes.GeneratePK) {
    return <KeypairIcon />;
  }
  if (type === ImportTypes.ImportSeedWallet) {
    return <WalletIcon />;
  }
  if (type === ImportTypes.ImportPrivateKey) {
    return <KeyIcon />;
  }
  if (type === ImportTypes.ImportJSON) {
    return <DownloadIcon />;
  }
  return <KeypairIcon />;
}

export default function SelectImportType (props: IRenderProps) {
  const { onSelect } = props;

  function handleSelect (code: ImportTypes) {
    if (onSelect) {
      onSelect(code);
    }
  }

  return (
    <Grid container={true}>
      <Grid item={true} xs={12}>
        <List>
          {supportedTypes.map((b, i) =>
            (
              <div key={b.code}>
              <ListItem
                alignItems='flex-start'
                button={true}
                onClick={() => handleSelect(b.code)}
              >
                <ListItemAvatar>
                  <ListItemIcon>
                    {icon(b.code)}
                  </ListItemIcon>
                </ListItemAvatar>
                <ListItemText
                  primary={b.title}
                  secondary={b.description}
                />
              </ListItem>
                {i > 0 ? <Divider variant='inset' component='li' /> : null}
            </div>
            )
          )}
        </List>
      </Grid>
    </Grid>
  );
}
