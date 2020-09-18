import {CurrencyEtc, CurrencyEth} from '@emeraldplatform/ui-icons';
import {AnyCoinCode, CurrencyCode, StableCoinCode} from '@emeraldwallet/core';
import {List, ListItem, ListItemAvatar, ListItemText, Menu} from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import {Button, CoinAvatar} from '@emeraldwallet/ui';
import {BigAmount, FormatterBuilder} from "@emeraldpay/bigamount";

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
  total: BigAmount;
  fiatCurrency?: CurrencyCode | StableCoinCode;
  byChain: Array<{
    token: AnyCoinCode;
    total: BigAmount;
    fiatRate: number;
    fiatAmount: BigAmount;
  }>;
  classes?: any;
}

const fmt = new FormatterBuilder()
  .number(3, true, 2, format)
  .append(" ")
  .unitCode()
  .build()

function TotalButton(props: IProps): React.ReactElement {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const {total, byChain, fiatCurrency, classes} = props;

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleToggle = (event: any): void => {
    setAnchorEl(event.currentTarget);
  };

  const totalFormatted = fmt.format(total);
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
            const coins = fmt.format(c.total);
            const fiat = fmt.format(c.fiatAmount);
            return (
              <ListItem key={c.total.units.base.code}>
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
  return prev.total.equals(next.total);
}

export default React.memo(StyledTotalButton, propsAreEqual);
