import { BlockchainCode, TokenRegistry } from '@emeraldwallet/core';
import { IState, addAccount, settings } from '@emeraldwallet/store';
import { Back, CoinAvatar, Page } from '@emeraldwallet/ui';
import { Divider, Grid, List, ListItem, ListItemAvatar, ListItemText } from '@material-ui/core';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import * as React from 'react';
import { connect } from 'react-redux';

interface BlockchainRef {
  assets: string[];
  code: BlockchainCode;
  name: string;
}

interface StateProps {
  blockchain?: BlockchainCode;
  supportedBlockchain: BlockchainRef[];
}

interface DispatchProps {
  selectBlockchain(code?: BlockchainCode): void;
}

const SelectBlockchain: React.FC<StateProps & DispatchProps> = ({
  blockchain,
  supportedBlockchain,
  selectBlockchain,
}) => (
  <Page leftIcon={<Back />} title={'Select cryptocurrency'}>
    <Grid container>
      <Grid item xs={12}>
        <List>
          {supportedBlockchain.map((chain, i) => (
            <div key={chain.code}>
              {i > 0 ? <Divider variant="inset" component="li" /> : null}
              <ListItem
                button
                alignItems="flex-start"
                selected={chain.code === blockchain}
                onClick={() => selectBlockchain(chain.code)}
              >
                <ListItemAvatar>
                  <ListItemIcon>
                    <CoinAvatar blockchain={chain.code} />
                  </ListItemIcon>
                </ListItemAvatar>
                <ListItemText primary={chain.name} secondary={chain.assets.join(', ')} />
              </ListItem>
            </div>
          ))}
        </List>
      </Grid>
    </Grid>
  </Page>
);

export default connect<StateProps, DispatchProps, unknown, IState>(
  (state) => {
    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const supportedBlockchain = settings.selectors.currentChains(state).map<BlockchainRef>((chain) => {
      const { coinTicker } = chain.params;

      const tokens = tokenRegistry.getStablecoins(chain.params.code).map(({ symbol }) => symbol);

      return {
        assets: [coinTicker, ...tokens],
        code: chain.params.code,
        name: chain.getTitle(),
      };
    });

    return {
      supportedBlockchain,
      blockchain: state.addAccount?.blockchain,
    };
  },
  (dispatch) => ({
    selectBlockchain: (code?: BlockchainCode) => {
      dispatch(addAccount.actions.setBlockchain(code));
      dispatch(addAccount.actions.nextPage());
    },
  }),
)(SelectBlockchain);
