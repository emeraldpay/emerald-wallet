import { Wei } from '@emeraldplatform/eth';
import { CurrencyEtc, CurrencyEth } from '@emeraldplatform/ui-icons';
import { AnyCoinCode, CurrencyCode, IUnits, StableCoinCode, Units } from '@emeraldwallet/core';
import { List, ListItem, ListItemAvatar, ListItemText, Menu } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import { Button, CoinAvatar } from '@emeraldwallet/ui';

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

const CoinSymbol: React.FC<{coinTicker: string}> = ({ coinTicker }: { coinTicker: string }) => {
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

export interface IProps {
  total: IUnits;
  fiatCurrency?: CurrencyCode | StableCoinCode;
  byChain: Array<{
    token: AnyCoinCode;
    total: Wei | IUnits;
    fiatRate: number;
    fiatAmount: IUnits;
  }>;
  classes?: any;
}

function TotalButton(props: IProps): React.ReactElement {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { total, byChain, fiatCurrency, classes } = props;

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleToggle = (event: any): void => {
    setAnchorEl(event.currentTarget);
  };

  const totalFormatted = `${total.amountAsString(format)} ${fiatCurrency}`;
  return (
    <div>
      <Button
        variant='text'
        disabled={false}
        label={totalFormatted}
        classes={classes}
        onClick={handleToggle}
        icon={<CoinSymbol coinTicker={fiatCurrency as string}/>}
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
        onClose={handleClose}
      >
        <List>
          {byChain.map((c) => {
            let coins = '';
            if (Units.isUnits(c.total)) {
              coins = c.total.toBigNumber()
                .dividedBy(new BigNumber(10).pow(c.total.decimals))
                .toFormat(3, format);
            } else {
              coins = (c.total as Wei).toEther(3);
            }
            coins += ` ${c.token.toUpperCase()}`;
            const fiat = `${c.fiatAmount.amountAsString(format)} ${fiatCurrency}`;
            return (
              <ListItem key={c.token}>
                <ListItemAvatar>
                  <CoinAvatar chain={c.token}/>
                </ListItemAvatar>
                <ListItemText primary={coins} secondary={fiat}/>
              </ListItem>
            );
          })}
        </List>
      </Menu>
    </div>
  );
}

const StyledTotalButton = withStyles(styles)(TotalButton);

function propsAreEqual (prev: IProps, next: IProps): boolean {
  // We re-render only if total amount changed
  return (prev.total.amount === next.total.amount && prev.total.decimals === next.total.decimals);
}

export default React.memo(StyledTotalButton, propsAreEqual);
