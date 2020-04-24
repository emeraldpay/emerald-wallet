import { BlockchainCode } from '@emeraldwallet/core';
import { addAccount, IState, settings } from '@emeraldwallet/store';
import { CoinAvatar, CoinIcon } from '@emeraldwallet/ui';
import {
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText, Radio, RadioGroup, Typography
} from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import * as React from 'react';
import { connect } from 'react-redux';

interface BlockchainRef {
  code: BlockchainCode;
  name: string;
  assets: string[];
}

interface OwnProps {
}

interface RenderProps {
  supportedBlockchain: BlockchainRef[];
  blockchain?: BlockchainCode;
}

interface DispatchProps {
  selectBlockchain: (code?: BlockchainCode) => void;
}

const SelectBlockchain = ((props: RenderProps & DispatchProps) => {
  const { supportedBlockchain, blockchain } = props;
  const { selectBlockchain } = props;

  return (
    <Grid container={true}>
      <Grid item={true} xs={12} >
        <List>
          {supportedBlockchain.map((b, i) =>
              <div key={b.code}>
                {i > 0 ? <Divider variant='inset' component='li' /> : null}
                <ListItem
                  alignItems='flex-start'
                  button={true}
                  selected={b.code === blockchain}
                  onClick={() => selectBlockchain(b.code)}
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
          )}
        </List>
      </Grid>
    </Grid>
  );
});

export default connect<RenderProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const supportedBlockchain = settings.selectors.currentChains(state).map((c) => {
      return {
        code: c.params.code,
        name: c.getTitle(),
        assets: c.getAssets()
      };
    });
    return {
      supportedBlockchain,
      blockchain: state.addAccount!!.blockchain
    };
  },
  (dispatch, ownProps) => {
    return {
      selectBlockchain: (code?: BlockchainCode) => {
        dispatch(addAccount.actions.setBlockchain(code));
        dispatch(addAccount.actions.nextPage());
      }
    };
  }
)((SelectBlockchain));
