import * as React from 'react';
import Menu from '@material-ui/core/Menu';
import MenuList from '@material-ui/core/MenuList';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import {CSSProperties, withStyles} from '@material-ui/styles';
import { CurrencyEtc, CurrencyEth} from '@emeraldplatform/ui-icons';

import { CoinAvatar } from '../../../common/CoinIcon';
import Button from '../../../common/Button';

interface Props {
  total: any;
  fiatCurrency?: string;
  byChain: any;
  classes?: any;
}

interface State {
  anchorEl: any;
}

const styles = {
  text: {
    textTransform: 'none',
    fontWeight: 'normal',
    fontSize: '16px',
  } as CSSProperties,
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


const StyledTotal = withStyles(styles)(TotalButton);

export default StyledTotal;
