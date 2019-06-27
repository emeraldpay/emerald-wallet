// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js';
import Menu from '@material-ui/core/Menu';
import MenuList from '@material-ui/core/MenuList';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { BlockchainCode } from '@emeraldwallet/core';
import { withStyles } from '@material-ui/styles';
import { Wei } from '@emeraldplatform/eth';
import { CurrencyEtc, CurrencyEth} from '@emeraldplatform/ui-icons';
import { Button, CoinAvatar } from '@emeraldwallet/ui';
import Accounts from '../../../../store/vault/accounts';
import WalletSettings from '../../../../store/wallet/settings';

type Props = {
  total: any,
  fiatCurrency?: string,
  byChain: any
};

const styles = {
  text: {
    textTransform: 'none',
    fontWeight: 'normal',
    fontSize: '16px',
  },
  root: {
    lineHeight: 'inherit',
  },
};

const CoinSymbol = ({ coinTicker }) => {
  if (coinTicker === 'ETH') {
    return (<CurrencyEth />);
  }
  if (coinTicker === 'ETC') {
    return (<CurrencyEtc />);
  }
  return null;
};

class TotalButton extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
    };
  }

  handleToggle = (event) => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  render() {
    const {
      total, byChain, fiatCurrency, classes,
    } = this.props;
    const { anchorEl } = this.state;
    const totalFormatted = `${total.toFixed(2)} ${fiatCurrency}`;
    return (
      <div>
        <Button
          color="secondary"
          variant="text"
          disabled={false}
          label={totalFormatted}
          classes={classes}
          onClick={this.handleToggle}
          icon={<CoinSymbol coinTicker={fiatCurrency} />}
        />
        <Menu
          elevation={0}
          getContentAnchorEl={null}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          id="totals"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        >
          <MenuList>
            {byChain.map((c) => {
              const ether = `${c.total.toEther(3)} ${c.chain.toUpperCase()}`;
              const fiat = `${c.fiatAmount.toFixed(2)} ${fiatCurrency}`;
              return (<ListItem key={c.chain}>
                <ListItemAvatar>
                  <CoinAvatar chain={c.chain}/>
                </ListItemAvatar>
                <ListItemText primary={ether} secondary={fiat} />
              </ListItem>);
            })}
          </MenuList>
        </Menu>
      </div>
    );
  }
}

const Total = ({
  total, byChain, fiatCurrency,
}: Props) => {
  return (
    <TotalButton byChain={byChain} total={total} fiatCurrency={fiatCurrency} />
  );
};

Total.propTypes = {
  total: PropTypes.object.isRequired,
  fiatCurrency: PropTypes.string.isRequired,
  byChain: PropTypes.array.isRequired,
};

const StyledTotal = withStyles(styles)(Total);

export default connect(
  (state, ownProps) => {
    // Sum of balances of all known accounts.
    const fiatCurrency = WalletSettings.selectors.fiatCurrency(state);
    const byChain = [];
    const chains = [BlockchainCode.ETC, BlockchainCode.ETH];
    let total = new BigNumber(0);
    chains.forEach((chain) => {
      const chainTotal: Wei = Accounts.selectors.selectTotalBalance(chain, state);
      const fiatRate = WalletSettings.selectors.fiatRate(chain, state);
      let fiatAmount = new BigNumber(0);
      if (fiatRate && fiatCurrency) {
        fiatAmount = fiatAmount.plus(chainTotal.toExchange(fiatRate));
      }
      byChain.push({
        chain,
        total: chainTotal,
        fiatRate,
        fiatAmount,
      });
      total = total.plus(fiatAmount);
    });

    return {
      fiatCurrency,
      byChain,
      total,
    };
  },
  (dispatch, ownProps) => ({})
)(StyledTotal);
