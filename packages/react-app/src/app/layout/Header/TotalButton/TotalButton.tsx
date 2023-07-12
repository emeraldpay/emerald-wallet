import {
  BlockchainCode,
  CurrencyAmount,
  TokenAmount,
  blockchainIdToCode,
  formatAmount,
  formatFiatAmount,
} from '@emeraldwallet/core';
import { ConvertedBalance } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import { List, ListItem, ListItemAvatar, ListItemText, Menu, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { AssetIcon } from '../../../../common/AssetIcon';

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

export interface StateProps {
  balances: ConvertedBalance[];
  loading: boolean;
  totalBalance?: CurrencyAmount;
}

const TotalButton: React.FC<StateProps> = ({ balances, loading, totalBalance }) => {
  const styles = useStyles();

  const [menuElement, setMenuElement] = React.useState<HTMLButtonElement | null>(null);

  const onOpen = (event: React.MouseEvent<HTMLButtonElement>): void => {
    if (balances.length > 0) {
      setMenuElement(event.currentTarget);
    }
  };

  const { code: fiatCurrency } = totalBalance?.units.top ?? {};

  return loading ? null : (
    <>
      {totalBalance?.isPositive() && (
        <Button
          classes={styles}
          disabled={false}
          label={formatFiatAmount(totalBalance)}
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
            {balances.map(({ balance, fiatBalance }) => {
              if (fiatBalance == null || fiatBalance.isZero()) {
                return null;
              }

              let asset: string;
              let blockchain: BlockchainCode | undefined;

              if (TokenAmount.is(balance)) {
                asset = balance.token.address;
                blockchain = blockchainIdToCode(balance.token.blockchain);
              } else {
                asset = balance.units.top.code;
              }

              return (
                <ListItem key={asset}>
                  <ListItemAvatar>
                    <AssetIcon asset={asset} blockchain={blockchain} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={formatAmount(balance)}
                    secondary={formatFiatAmount(new CurrencyAmount(fiatBalance.number, fiatCurrency))}
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
