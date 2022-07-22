import { CurrentAddress, EntryId, isBitcoinEntry, isEthereumEntry, Uuid, Wallet } from '@emeraldpay/emerald-vault-core';
import { AnyCoinCode, BlockchainCode, blockchainIdToCode, Blockchains } from '@emeraldwallet/core';
import { registry } from '@emeraldwallet/erc20';
import { accounts, IBalanceValue, IState, screen } from '@emeraldwallet/store';
import { Address, Back, Page, WalletReference } from '@emeraldwallet/ui';
import { Box, Button, createStyles, FormControl, Grid, InputLabel, MenuItem, Select } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import { clipboard } from 'electron';
import * as React from 'react';
import { useQRCode } from 'react-qrcode';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    copyCell: {
      paddingLeft: 8,
      paddingTop: 18,
    },
    form: {
      marginTop: 40,
    },
  }),
);

interface Accept {
  addresses: string[];
  blockchain: BlockchainCode;
  entryId: EntryId;
  token: AnyCoinCode;
}

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  accepted: Accept[];
  assets: IBalanceValue[];
  wallet?: Wallet;
}

interface DispatchProps {
  onCancel(): void;
  onSave(entryId: EntryId): void;
}

function distinct<T>(value: T, index: number, array: T[]): boolean {
  return array.indexOf(value) === index;
}

function anyToken(accepted: Accept[], blockchain: BlockchainCode): AnyCoinCode | undefined {
  const [accepts] = accepted.filter((item) => item.blockchain === blockchain);

  return accepts?.token;
}

function anyAddress(accepted: Accept[], blockchain: BlockchainCode, token?: AnyCoinCode): string | undefined {
  const [accepts] = accepted.filter((item) => item.blockchain === blockchain && item.token === token);
  const [address] = accepts?.addresses ?? [];

  return address;
}

const ReceiveScreen: React.FC<DispatchProps & OwnProps & StateProps> = ({
  accepted,
  assets,
  wallet,
  onCancel,
  onSave,
}) => {
  const styles = useStyles();

  const availableBlockchains = React.useMemo(
    () => accepted.map((accept) => accept.blockchain).filter(distinct),
    [accepted],
  );

  const [currentBlockchain, setCurrentBlockchain] = React.useState(availableBlockchains[0]);
  const [currentToken, setCurrentToken] = React.useState(anyToken(accepted, currentBlockchain));
  const [currentAddress, setCurrentAddress] = React.useState(anyAddress(accepted, currentBlockchain, currentToken));

  const availableAddresses = React.useMemo(
    () =>
      accepted
        .filter((item) => item.blockchain === currentBlockchain && item.token === currentToken)
        .map((item) => item.addresses)
        .reduce((carry: string[], address: string[]) => [...carry, ...address], [])
        .filter(distinct),
    [accepted, currentBlockchain, currentToken],
  );

  const availableCoins = React.useMemo(
    () =>
      accepted
        .filter((item) => item.blockchain === currentBlockchain)
        .map((item) => item.token)
        .filter(distinct),
    [accepted, currentBlockchain],
  );

  const currentEntry = React.useMemo(
    () =>
      currentAddress == null
        ? undefined
        : accepted.find((item) => item.blockchain === currentBlockchain && item.addresses.indexOf(currentAddress) >= 0)
            ?.entryId,
    [accepted, currentAddress, currentBlockchain],
  );

  const tokenInfo = React.useMemo(
    () => registry.tokens[currentBlockchain]?.find((token) => token.symbol === currentToken),
    [currentBlockchain, currentToken],
  );

  const selectBlockchain = React.useCallback(
    (blockchain: BlockchainCode): void => {
      const token = anyToken(accepted, blockchain);

      setCurrentAddress(anyAddress(accepted, blockchain, token));
      setCurrentBlockchain(blockchain);
      setCurrentToken(token);
    },
    [accepted],
  );

  const selectToken = React.useCallback(
    (token: AnyCoinCode): void => {
      setCurrentAddress(anyAddress(accepted, currentBlockchain, token));
      setCurrentToken(token);
    },
    [accepted, currentBlockchain],
  );

  let qrCodeValue = currentAddress;

  if (tokenInfo != null) {
    //TODO there is no standards for that, check later
    qrCodeValue = `${qrCodeValue}?erc20=${tokenInfo.symbol}`;
  }

  const qrCode = useQRCode(qrCodeValue ?? '');

  return (
    <Page title="Request Cryptocurrency" leftIcon={<Back onClick={onCancel} />}>
      {wallet != null && <WalletReference wallet={wallet} assets={assets} />}
      <Grid container>
        <Grid item xs={8}>
          <Grid container className={styles.form}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="blockchain-select-label">Blockchain</InputLabel>
                <Select
                  disabled={availableBlockchains.length <= 1}
                  labelId="blockchain-select-label"
                  value={currentBlockchain}
                  onChange={(e) => selectBlockchain(e.target.value as BlockchainCode)}
                >
                  {availableBlockchains.map((blockchain) => (
                    <MenuItem key={blockchain} value={blockchain}>
                      {Blockchains[blockchain].getTitle()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={3}>
              <FormControl fullWidth>
                <InputLabel id="coin-select-label">Coin</InputLabel>
                <Select
                  disabled={availableCoins.length <= 1}
                  labelId="coin-select-label"
                  value={currentToken}
                  onChange={(e) => selectToken(e.target.value as AnyCoinCode)}
                >
                  {availableCoins.map((token) => (
                    <MenuItem key={token} value={token}>
                      {token}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={9}>
              <FormControl fullWidth={true}>
                <InputLabel id="address-select-label">Address</InputLabel>
                <Select
                  disabled={availableAddresses.length <= 1}
                  labelId="address-select-label"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value as string)}
                >
                  {availableAddresses.map((address) => (
                    <MenuItem key={address} value={address}>
                      <Address address={address} disableCopy={true} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {currentAddress != null && (
              <Grid item xs={1} className={styles.copyCell}>
                <Button onClick={() => clipboard.writeText(currentAddress)}>
                  <LibraryAddCheckIcon />
                  Copy
                </Button>
              </Grid>
            )}
          </Grid>
        </Grid>
        {qrCodeValue != null && (
          <Grid item xs={4}>
            <Box>
              <img src={qrCode} alt="QR Code" width={250} />
            </Box>
          </Grid>
        )}
      </Grid>
      <Grid item xs={8}>
        <Button onClick={() => onCancel()}>Cancel</Button>
        {currentEntry != null && (
          <Button color="primary" variant="contained" onClick={() => onSave(currentEntry)}>
            Save
          </Button>
        )}
      </Grid>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId);
    const assets: IBalanceValue[] = wallet == null ? [] : accounts.selectors.getWalletBalances(state, wallet, false);

    const accepted =
      wallet?.entries
        .filter((entry) => !entry.receiveDisabled)
        .reduce<Accept[]>((carry, entry) => {
          let address: string | undefined;

          if (isEthereumEntry(entry)) {
            address = entry.address?.value;
          } else if (isBitcoinEntry(entry)) {
            address = entry.addresses.find((a: CurrentAddress) => a.role === 'receive')?.address;
          }

          if (address == null) {
            return carry;
          }

          const blockchain = blockchainIdToCode(entry.blockchain);

          const accepts = Blockchains[blockchain].getAssets().reduce<Accept[]>((carry, token) => {
            if (address == null) {
              return carry;
            }

            return [
              ...carry,
              {
                blockchain,
                token,
                addresses: [address],
                entryId: entry.id,
              },
            ];
          }, []);

          return [
            ...carry,
            {
              blockchain,
              addresses: [address],
              entryId: entry.id,
              token: Blockchains[blockchain].params.coinTicker,
            },
            ...accepts,
          ];
        }, []) ?? [];

    return {
      accepted,
      assets,
      wallet,
    };
  },
  (dispatch, ownProps) => ({
    onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId)),
    onSave: (entryId: EntryId) => {
      dispatch(accounts.actions.nextAddress(entryId, 'receive'));
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
    },
  }),
)(ReceiveScreen);
