import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { BlockchainCode } from '@emeraldwallet/core';
import { CoinAvatar } from '@emeraldwallet/ui';
import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import * as React from 'react';

interface IProps {
  onCancel?: any;
  supportedBlockchain: any[];
  selected?: any;
  selectBlockchain: (code?: BlockchainCode) => void;
}

export default function SelectBlockchain (props: IProps) {
  const { supportedBlockchain, selected } = props;

  const chains = supportedBlockchain.map((c) => {
    return {
      code: c.params.code,
      name: c.getTitle(),
      assets: c.getAssets()
    };
  });

  function handleGoBack () {
    if (props.onCancel) {
      props.onCancel();
    }
  }

  function handleSelection (code: any) {
    if (props.selectBlockchain) {
      props.selectBlockchain(code);
    }
  }

  return (
      <Grid container={true}>
        <Grid item={true} xs={12} >
          <List>
            {chains.map((b, i: number) => (
              <div key={b.code}>
                {i > 0 ? <Divider variant='inset' component='li' /> : null}
                <ListItem
                  alignItems='flex-start'
                  button={true}
                  selected={b.code === selected}
                  onClick={() => handleSelection(b.code)}
                >
                  <ListItemAvatar>
                    <ListItemIcon>
                      <CoinAvatar chain={b.code}/>
                    </ListItemIcon>
                  </ListItemAvatar>
                  <ListItemText
                    primary={b.name}
                    secondary={b.assets.join(', ')}
                  />
                </ListItem>
              </div>
            ))}
          </List>
        </Grid>
      </Grid>
  );
}
