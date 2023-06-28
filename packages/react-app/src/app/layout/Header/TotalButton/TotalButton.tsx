import { BigAmount, FormatterBuilder } from '@emeraldpay/bigamount';
import { CurrencyAmount, formatAmount } from '@emeraldwallet/core';
import { Button, CurrencyIcon } from '@emeraldwallet/ui';
import { List, ListItem, ListItemAvatar, ListItemText, Menu, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(
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
  fiatAmount?: BigAmount;
  fiatRate: number;
  total: BigAmount;
  token: string;
}

export interface StateProps {
  fiatCurrencies: FiatCurrencies[];
  loading: boolean;
  totalBalance?: BigAmount;
}

const fiatFormatter = new FormatterBuilder().useTopUnit().number(2).append(' ').unitCode().build();

const TotalButton: React.FC<StateProps> = ({ fiatCurrencies, loading, totalBalance }) => {
  const styles = useStyles();

  const [menuElement, setMenuElement] = React.useState<HTMLButtonElement | null>(null);

  const onOpen = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (fiatCurrencies.length > 0) {
      setMenuElement(event.currentTarget);
    }
  };

  const { code: fiatCurrency } = totalBalance?.units.top ?? {};

  return loading ? null : (
    <>
      {totalBalance != null && fiatCurrency != null && totalBalance.isPositive() && (
        <Button
          classes={styles}
          disabled={false}
          label={fiatFormatter.format(new CurrencyAmount(totalBalance.number, fiatCurrency))}
          variant="text"
          onClick={onOpen}
        />
      )}
      {fiatCurrency != null && (
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
            {fiatCurrencies.map(({ fiatAmount, token, total }) => {
              if (fiatAmount == null || fiatAmount.isZero()) {
                return null;
              }

              return (
                <ListItem key={token}>
                  <ListItemAvatar>
                    <CurrencyIcon currency={token} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={formatAmount(total)}
                    secondary={fiatFormatter.format(new CurrencyAmount(fiatAmount.number, fiatCurrency))}
                  />
                </ListItem>
              );
            })}
          </List>
        </Menu>
      )}
    </>
  );
};

export default React.memo(
  TotalButton,
  ({ totalBalance: prevTotalBalance }: StateProps, { totalBalance: nextTotalBalance }: StateProps): boolean =>
    prevTotalBalance == null || nextTotalBalance == null ? false : prevTotalBalance.equals(nextTotalBalance),
);
