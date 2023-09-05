import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { amountFactory, blockchainIdToCode, formatAmount } from '@emeraldwallet/core';
import { IState, accounts, tokens } from '@emeraldwallet/store';
import { Account } from '@emeraldwallet/ui';
import { Menu, MenuItem } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  disabled?: boolean;
  entries: WalletEntry[];
  selected: WalletEntry;
  onSelect(entry: WalletEntry): void;
}

interface StateProps {
  getBalances(entry: WalletEntry): string[];
}

const SelectEntry: React.FC<OwnProps & StateProps> = ({ disabled, entries, selected, getBalances, onSelect }) => {
  const [menuElement, setMenuElement] = React.useState<HTMLDivElement | null>(null);

  const onOpenMenu = ({ currentTarget }: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    setMenuElement(currentTarget);
  };

  const onCloseMenu = (): void => {
    setMenuElement(null);
  };

  const onEntryClick = (entry: WalletEntry): void => {
    onSelect(entry);
    onCloseMenu();
  };

  const renderEntry = (entry: WalletEntry, selected = false): React.ReactNode => {
    if (entry.address == null) {
      return null;
    }

    return (
      <Account
        address={entry.address.value}
        addressProps={{ hideCopy: true }}
        addressWidth={450}
        balances={selected ? undefined : getBalances(entry)}
        disabled={disabled}
        identity={true}
        onClick={selected ? onOpenMenu : () => onEntryClick(entry)}
      />
    );
  };

  return (
    <>
      {renderEntry(selected, true)}
      <Menu anchorEl={menuElement} open={menuElement != null} onClose={onCloseMenu}>
        {entries.map((entry) => {
          if (entry.address == null) {
            return undefined;
          }

          return (
            <MenuItem key={`${entry.blockchain}:${entry.address.value}`} selected={entry.id === selected.id}>
              {renderEntry(entry)}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>((state) => ({
  getBalances(entry) {
    const blockchain = blockchainIdToCode(entry.blockchain);

    const balance = accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0));

    if (isEthereumEntry(entry) && entry.address != null) {
      const tokenBalances = tokens.selectors.selectBalances(state, blockchain, entry.address.value);

      return [balance, ...tokenBalances.filter((tokenBalance) => tokenBalance.isPositive())].map((amount) =>
        formatAmount(amount),
      );
    }

    return [balance].map((amount) => formatAmount(amount));
  },
}))(SelectEntry);
