import {
  AddressRole,
  CurrentAddress,
  EntryId,
  Uuid,
  Wallet,
  isBitcoinEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, TokenRegistry, blockchainIdToCode } from '@emeraldwallet/core';
import { IBalanceValue, IState, accounts, screen } from '@emeraldwallet/store';
import { Address, Back, ButtonGroup, Page, WalletReference } from '@emeraldwallet/ui';
import { Button, FormControl, Grid, InputLabel, MenuItem, Select, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import { clipboard } from 'electron';
import * as React from 'react';
import { useQRCode } from 'react-qrcode';
import { connect } from 'react-redux';

const useStyles = makeStyles(
  createStyles({
    form: {
      marginTop: 40,
    },
    copy: {
      paddingLeft: 8,
      paddingTop: 18,
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      marginTop: 20,
      width: '100%',
    },
    code: {
      display: 'flex',
      justifyContent: 'center',
    },
  }),
);

interface BaseAccept {
  blockchain: BlockchainCode;
  entryId: EntryId;
  token: string;
}

interface BitcoinAccept extends BaseAccept {
  xpub: string;
}

interface EthereumAccept extends BaseAccept {
  addresses: string[];
}

type Accept = BitcoinAccept | EthereumAccept;

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  accepted: Accept[];
  assets: IBalanceValue[];
  tokenRegistry: TokenRegistry;
  wallet?: Wallet;
  walletIcon?: string | null;
}

interface DispatchProps {
  getXPubPositionalAddress(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress>;
  onCancel(): void;
  onSave(entryId: EntryId): void;
}

function anyToken(accepted: Accept[], blockchain: BlockchainCode): string | undefined {
  const [accepts] = accepted.filter((item) => item.blockchain === blockchain);

  return accepts?.token;
}

function distinct<T>(value: T, index: number, array: T[]): boolean {
  return array.indexOf(value) === index;
}

function isBitcoinAccept(accept: Accept): accept is BitcoinAccept {
  return (accept as BitcoinAccept).xpub != null;
}

const ReceiveScreen: React.FC<DispatchProps & OwnProps & StateProps> = ({
  accepted,
  assets,
  tokenRegistry,
  wallet,
  walletIcon,
  getXPubPositionalAddress,
  onCancel,
  onSave,
}) => {
  const styles = useStyles();

  const availableBlockchains = React.useMemo(
    () => accepted.map((accept) => accept.blockchain).filter(distinct),
    [accepted],
  );

  const [availableAddresses, setAvailableAddresses] = React.useState<string[]>([]);
  const [currentBlockchain, setCurrentBlockchain] = React.useState(availableBlockchains[0]);
  const [currentToken, setCurrentToken] = React.useState(anyToken(accepted, currentBlockchain));
  const [currentAddress, setCurrentAddress] = React.useState<string | undefined>(undefined);

  const availableCoins = React.useMemo(
    () =>
      accepted
        .filter((item) => item.blockchain === currentBlockchain)
        .map((item) => item.token)
        .filter(distinct),
    [accepted, currentBlockchain],
  );

  const currentEntry = React.useMemo(
    () => accepted.find((item) => item.blockchain === currentBlockchain)?.entryId,
    [accepted, currentBlockchain],
  );

  const selectBlockchain = React.useCallback(
    (blockchain: BlockchainCode): void => {
      const token = anyToken(accepted, blockchain);
      const [address] = availableAddresses;

      setCurrentAddress(address);
      setCurrentBlockchain(blockchain);
      setCurrentToken(token);
    },
    [accepted, availableAddresses],
  );

  const selectToken = React.useCallback(
    (token: string): void => {
      const [address] = availableAddresses;

      setCurrentAddress(address);
      setCurrentToken(token);
    },
    [availableAddresses],
  );

  React.useEffect(() => {
    let mounted = true;

    const accepts = accepted.filter((item) => item.blockchain === currentBlockchain && item.token === currentToken);

    Promise.all(
      accepts.map(async (accept) => {
        if (isBitcoinAccept(accept)) {
          const { address } = await getXPubPositionalAddress(accept.entryId, accept.xpub, 'receive');

          return [address];
        }

        return accept.addresses;
      }),
    ).then((addresses) => {
      if (mounted) {
        const uniqueAddresses = addresses
          .reduce((carry: string[], address: string[]) => [...carry, ...address], [])
          .filter(distinct);

        setAvailableAddresses(uniqueAddresses);
        setCurrentAddress(uniqueAddresses[0]);
      }
    });

    return () => {
      mounted = false;
    };
  }, [accepted, currentBlockchain, currentToken, getXPubPositionalAddress]);

  let qrCodeValue = currentAddress;

  if (currentToken != null) {
    try {
      const tokenData = tokenRegistry.bySymbol(currentBlockchain, currentToken);

      //TODO there is no standards for that, check later
      qrCodeValue = `${qrCodeValue}?erc20=${tokenData.symbol}`;
    } catch (exception) {
      // Nothing
    }
  }

  const qrCode = useQRCode(qrCodeValue ?? '');

  return (
    <Page title="Request Cryptocurrency" leftIcon={<Back onClick={onCancel} />}>
      {wallet != null && <WalletReference assets={assets} wallet={wallet} walletIcon={walletIcon} />}
      <Grid container>
        <Grid item xs={8}>
          <Grid container className={styles.form}>
            <Grid item xs={10}>
              <FormControl fullWidth>
                <InputLabel id="blockchain-select-label">Blockchain</InputLabel>
                <Select
                  disabled={availableBlockchains.length <= 1}
                  labelId="blockchain-select-label"
                  value={currentBlockchain}
                  onChange={(event) => selectBlockchain(event.target.value as BlockchainCode)}
                >
                  {availableBlockchains.map((blockchain) => (
                    <MenuItem key={blockchain} value={blockchain}>
                      {Blockchains[blockchain].getTitle()}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={2}>
              <FormControl fullWidth>
                <InputLabel id="coin-select-label">Coin</InputLabel>
                <Select
                  disabled={availableCoins.length <= 1}
                  labelId="coin-select-label"
                  value={currentToken}
                  onChange={(event) => selectToken(event.target.value as string)}
                >
                  {availableCoins.map((token) => (
                    <MenuItem key={token} value={token}>
                      {token}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={10}>
              <FormControl fullWidth={true}>
                <InputLabel id="address-select-label">Address</InputLabel>
                <Select
                  disabled={availableAddresses.length <= 1}
                  labelId="address-select-label"
                  value={currentAddress ?? ''}
                  onChange={(event) => setCurrentAddress(event.target.value as string)}
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
              <Grid item xs={2} className={styles.copy}>
                <Button onClick={() => clipboard.writeText(currentAddress)}>
                  <LibraryAddCheckIcon />
                  Copy
                </Button>
              </Grid>
            )}
            <Grid item xs>
              <ButtonGroup classes={{ container: styles.buttons }}>
                <Button color="secondary" variant="contained" onClick={() => onCancel()}>
                  Cancel
                </Button>
                {currentEntry != null && (
                  <Button color="primary" variant="contained" onClick={() => onSave(currentEntry)}>
                    Save
                  </Button>
                )}
              </ButtonGroup>
            </Grid>
          </Grid>
        </Grid>
        {qrCodeValue != null && (
          <Grid item xs={4}>
            <div className={styles.code}>
              <img src={qrCode} alt="QR Code" width={240} />
            </div>
          </Grid>
        )}
      </Grid>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }) => {
    const wallet = accounts.selectors.findWallet(state, walletId);
    const assets: IBalanceValue[] = wallet == null ? [] : accounts.selectors.getWalletBalances(state, wallet);

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const accepted =
      wallet?.entries
        .filter((entry) => !entry.receiveDisabled)
        .reduce<Accept[]>((carry, entry) => {
          const blockchain = blockchainIdToCode(entry.blockchain);

          let address: string | undefined;

          if (isEthereumEntry(entry)) {
            address = entry.address?.value;
          } else if (isBitcoinEntry(entry)) {
            const { xpub } = entry.xpub.find(({ role }) => role === 'receive') ?? {};

            if (xpub != null) {
              return [
                ...carry,
                {
                  blockchain,
                  xpub,
                  entryId: entry.id,
                  token: Blockchains[blockchain].params.coinTicker,
                },
              ];
            }
          }

          if (address == null) {
            return carry;
          }

          const accepts = tokenRegistry.getStablecoins(blockchain).reduce<Accept[]>((carry, { symbol }) => {
            if (address == null) {
              return carry;
            }

            return [
              ...carry,
              {
                blockchain,
                addresses: [address],
                entryId: entry.id,
                token: symbol,
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
      tokenRegistry,
      wallet,
      walletIcon: state.accounts.icons[walletId],
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    getXPubPositionalAddress(entryId, xPub, role) {
      return dispatch(accounts.actions.getXPubPositionalAddress(entryId, xPub, role));
    },
    onCancel() {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
    },
    onSave(entryId: EntryId) {
      dispatch(accounts.actions.nextAddress(entryId, 'receive'));
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
    },
  }),
)(ReceiveScreen);
