import { BigAmount, FormatterBuilder } from '@emeraldpay/bigamount';
import { AnyCoinCode, CurrencyAmount, CurrencyCode, formatAmount } from '@emeraldwallet/core';
import { Button, CurrencyIcon } from '@emeraldwallet/ui';
import { List, ListItem, ListItemAvatar, ListItemText, Menu, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    label: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: 16,
    },
    root: {
      lineHeight: 'inherit',
    },
  }),
);

export interface FiatCurrencies {
  fiatAmount: BigAmount;
  fiatRate: number;
  total: BigAmount;
  token: AnyCoinCode;
}

export interface StateProps {
  fiatCurrencies: FiatCurrencies[];
  totalBalance: BigAmount;
}

const fiatFormatter = new FormatterBuilder().useTopUnit().number(2).append(' ').unitCode().build();

const TotalButton: React.FC<StateProps> = ({ fiatCurrencies, totalBalance }) => {
  const styles = useStyles();

  const fiatCurrency = React.useMemo(() => totalBalance.units.top.code as CurrencyCode, [totalBalance]);

  const [menuElement, setMenuElement] = React.useState<HTMLButtonElement | null>(null);

  const handleOpen = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (fiatCurrencies.length > 0) {
        setMenuElement(event.currentTarget);
      }
    },
    [fiatCurrencies],
  );

  const totalFormatted = fiatFormatter.format(new CurrencyAmount(totalBalance.number, fiatCurrency));

  return (
    <div>
      <Button classes={styles} disabled={false} label={totalFormatted} variant="text" onClick={handleOpen} />
      <Menu
        anchorEl={menuElement}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        getContentAnchorEl={null}
        open={menuElement != null}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={() => setMenuElement(null)}
      >
        <List>
          {fiatCurrencies.map((currency) => {
            const coinBalance = formatAmount(currency.total);
            const fiatBalance = fiatFormatter.format(new CurrencyAmount(currency.fiatAmount.number, fiatCurrency));

            return (
              <ListItem key={currency.token}>
                <ListItemAvatar>
                  <CurrencyIcon currency={currency.token} />
                </ListItemAvatar>
                <ListItemText primary={coinBalance} secondary={fiatBalance} />
              </ListItem>
            );
          })}
        </List>
      </Menu>
    </div>
  );
};

export default React.memo(TotalButton, (prev: StateProps, next: StateProps): boolean =>
  prev.totalBalance.equals(next.totalBalance),
);
