import { Wei } from '@emeraldplatform/eth';
import { CurrencyEtc, CurrencyEth } from '@emeraldplatform/ui-icons';
import { AnyCoinCode, CurrencyCode, StableCoinCode, Units } from '@emeraldwallet/core';
import { ListItem, ListItemAvatar, ListItemText, Menu, MenuList } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import Button from '../../../common/Button';
import { CoinAvatar } from '../../../common/CoinIcon';

export interface IProps {
  total: Units;
  fiatCurrency?: CurrencyCode | StableCoinCode;
  byChain: Array<{
    token: AnyCoinCode,
    total: Wei | Units,
    fiatRate: number,
    fiatAmount: Units
  }>;
  classes?: any;
}

interface IState {
  anchorEl: any;
}

const styles = createStyles({
  label: {
    textTransform: 'none',
    fontWeight: 'normal',
    fontSize: '16px'
  },
  root: {
    lineHeight: 'inherit'
  }
});

const CoinSymbol = ({ coinTicker }) => {
  if (coinTicker === 'ETH') {
    return (<CurrencyEth />);
  }
  if (coinTicker === 'ETC') {
    return (<CurrencyEtc />);
  }
  return null;
};

const format = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3
};

class TotalButton extends React.Component<IProps, IState> {
  constructor (props) {
    super(props);
    this.state = {
      anchorEl: null
    };
  }

  public handleToggle = (event) => {
    this.setState({
      anchorEl: event.currentTarget
    });
  }

  public handleClose = () => {
    this.setState({
      anchorEl: null
    });
  }

  public render () {
    const {
      total, byChain, fiatCurrency, classes
    } = this.props;
    const { anchorEl } = this.state;
    const totalFormatted = `${total.toBigNumber().toFormat(2, format)} ${fiatCurrency}`;
    return (
      <div>
        <Button
          variant='text'
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
            horizontal: 'left'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left'
          }}
          id='totals'
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={this.handleClose}
        >
          <MenuList>
            {byChain.map((c) => {
              let coins = '';
              if (Units.isUnits(c.total)) {
                coins = c.total.toBigNumber()
                  .dividedBy(new BigNumber(10).pow(c.total.decimals))
                  .toFormat(3, format);
              } else {
                coins = c.total.toEther(3);
              }
              coins += ` ${c.token.toUpperCase()}`;
              const fiat = `${c.fiatAmount.toBigNumber().toFormat(2, format)} ${fiatCurrency}`;
              return (
                <ListItem key={c.token}>
                  <ListItemAvatar>
                    <CoinAvatar chain={c.token}/>
                  </ListItemAvatar>
                  <ListItemText primary={coins} secondary={fiat} />
                </ListItem>
              );
            })}
          </MenuList>
        </Menu>
      </div>
    );
  }
}

const StyledTotal = withStyles(styles)(TotalButton);

export default StyledTotal;
