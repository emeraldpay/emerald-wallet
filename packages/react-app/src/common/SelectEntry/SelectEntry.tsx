import { WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { amountFactory, blockchainIdToCode, formatAmount } from '@emeraldwallet/core';
import { IState, TokenBalanceBelong, accounts, allowances, tokens } from '@emeraldwallet/store';
import { Account, Monospace } from '@emeraldwallet/ui';
import { Menu, MenuItem, Typography } from '@mui/material';
import * as React from 'react';
import { connect } from 'react-redux';

interface OwnProps {
  disabled?: boolean;
  entries: WalletEntry[];
  ownerAddress?: string | null;
  selectedEntry: WalletEntry;
  withAllowances?: boolean;
  onSelect(entry: WalletEntry, ownerAddress: string | undefined): void;
}

interface EntryAllowances {
  [entryId: string]: string[];
}

interface StateProps {
  entryAllowances: EntryAllowances;
  getBalances(entry: WalletEntry, ownerAddress?: string): string[];
}

const SelectEntry: React.FC<OwnProps & StateProps> = ({
  disabled,
  entries,
  entryAllowances,
  ownerAddress,
  selectedEntry,
  getBalances,
  onSelect,
}) => {
  const [menuElement, setMenuElement] = React.useState<HTMLDivElement | null>(null);

  const handleMenuClose = (): void => {
    setMenuElement(null);
  };

  const handleEntrySelect = (entry: WalletEntry, ownerAddress?: string): void => {
    onSelect(entry, ownerAddress);
    handleMenuClose();
  };

  const renderSelectedEntry = (): React.ReactElement => {
    if (selectedEntry.address == null) {
      return <Typography>Please select from entry...</Typography>;
    }

    let description: React.ReactElement | undefined;

    if (ownerAddress != null) {
      const { [selectedEntry.id]: allowances = [] } = entryAllowances;

      if (allowances.includes(ownerAddress)) {
        description = (
          <>
            Owner <Monospace text={ownerAddress} />
          </>
        );
      }
    }

    return (
      <Account
        address={selectedEntry.address.value}
        addressProps={{ hideCopy: true }}
        addressWidth={450}
        description={description}
        disabled={disabled}
        identity={true}
        onClick={({ currentTarget }) => setMenuElement(currentTarget)}
      />
    );
  };

  const renderAccounts = (): React.ReactNode => {
    return entries.map((entry) => {
      if (entry.address == null) {
        return undefined;
      }

      const accounts: React.ReactElement[] = [
        <MenuItem
          key={`${entry.blockchain}:${entry.address.value}`}
          selected={ownerAddress == null && entry.id === selectedEntry.id}
        >
          <Account
            key={entry.address.value}
            address={entry.address.value}
            addressProps={{ hideCopy: true }}
            addressWidth={450}
            balances={getBalances(entry)}
            disabled={disabled}
            identity={true}
            onClick={() => handleEntrySelect(entry, undefined)}
          />
        </MenuItem>,
      ];

      const { [entry.id]: allowances = [] } = entryAllowances;

      allowances.forEach((allowanceAddress) => {
        if (entry.address != null) {
          accounts.push(
            <MenuItem
              key={`${entry.blockchain}:${entry.address.value}:${allowanceAddress}`}
              selected={allowanceAddress === ownerAddress && entry.id === selectedEntry.id}
            >
              <Account
                key={`${entry.address.value}:${allowanceAddress}`}
                address={entry.address.value}
                addressProps={{ hideCopy: true }}
                addressWidth={450}
                balances={getBalances(entry, allowanceAddress)}
                disabled={disabled}
                description={
                  <>
                    Owner <Monospace text={allowanceAddress} />
                  </>
                }
                identity={true}
                onClick={() => handleEntrySelect(entry, allowanceAddress)}
              />
            </MenuItem>,
          );
        }
      });

      return accounts;
    });
  };

  return (
    <>
      {renderSelectedEntry()}
      <Menu anchorEl={menuElement} open={menuElement != null} onClose={handleMenuClose}>
        {renderAccounts()}
      </Menu>
    </>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>(
  (state, { entries, ownerAddress, withAllowances = false }) => {
    let entryAllowances: EntryAllowances = {};

    if (ownerAddress != null || withAllowances !== false) {
      entryAllowances = entries.reduce<EntryAllowances>((carry, entry) => {
        if (entry.address != null && isEthereumEntry(entry)) {
          const { value: address } = entry.address;

          allowances.selectors
            .getEntryAllowances(state, entry)
            .filter(({ spenderAddress }) => spenderAddress.toLowerCase() === address.toLowerCase())
            .forEach(({ ownerAddress }) => {
              if (carry[entry.id] == null) {
                carry[entry.id] = [ownerAddress];
              } else {
                carry[entry.id].push(ownerAddress);
              }
            });
        }

        return carry;
      }, {});
    }

    return {
      entryAllowances,
      getBalances(entry, ownerAddress) {
        const blockchain = blockchainIdToCode(entry.blockchain);

        const balance = accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0));

        if (isEthereumEntry(entry) && entry.address != null) {
          const tokenBalances = tokens.selectors.selectBalances(state, blockchain, entry.address.value, {
            belonging: ownerAddress == null ? TokenBalanceBelong.OWN : TokenBalanceBelong.ALLOWED,
            belongsTo: ownerAddress,
          });

          return [balance, ...tokenBalances.filter((tokenBalance) => tokenBalance.isPositive())].map((amount) =>
            formatAmount(amount),
          );
        }

        return [balance].map((amount) => formatAmount(amount));
      },
    };
  },
)(SelectEntry);
