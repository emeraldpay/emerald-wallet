import { BigAmount } from '@emeraldpay/bigamount';
import {
  AddressRole,
  CurrentAddress,
  EntryId,
  Uuid,
  Wallet,
  isBitcoinEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, EthereumAddress, TokenRegistry, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
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
  symbol: string;
}

interface BitcoinAccept extends BaseAccept {
  xpub: string;
}

interface EthereumAccept extends BaseAccept {
  addresses: string[];
  contractAddress?: string;
}

type Accept = BitcoinAccept | EthereumAccept;

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  accepted: Accept[];
  balances: BigAmount[];
  tokenRegistry: TokenRegistry;
  wallet?: Wallet;
  walletIcon?: string | null;
}

interface DispatchProps {
  getXPubPositionalAddress(entryId: string, xPub: string, role: AddressRole): Promise<CurrentAddress>;
  onCancel(): void;
  onSave(entryId: EntryId): void;
}

function anyAccept(accepted: Accept[], blockchain: BlockchainCode): Accept | undefined {
  const [accepts] = accepted.filter((item) => item.blockchain === blockchain);

  return accepts;
}

function isBitcoinAccept(accept: unknown): accept is BitcoinAccept {
  return accept != null && typeof accept === 'object' && 'xpub' in accept;
}

function isEthereumAccept(accept: unknown): accept is EthereumAccept {
  return accept != null && typeof accept === 'object' && 'addresses' in accept;
}

const ReceiveScreen: React.FC<DispatchProps & OwnProps & StateProps> = ({
  accepted,
  balances,
  tokenRegistry,
  wallet,
  walletIcon,
  getXPubPositionalAddress,
  onCancel,
  onSave,
}) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const availableBlockchains = React.useMemo(
    () => [...accepted.reduce<Set<BlockchainCode>>((carry, { blockchain }) => carry.add(blockchain), new Set())],
    [accepted],
  );

  const [availableAddresses, setAvailableAddresses] = React.useState<string[]>([]);
  const [currentBlockchain, setCurrentBlockchain] = React.useState(availableBlockchains[0]);
  const [currentAccept, setCurrentAccept] = React.useState(anyAccept(accepted, currentBlockchain));
  const [currentAddress, setCurrentAddress] = React.useState<string | undefined>(undefined);

  const availableAccepts = React.useMemo(
    () =>
      accepted.reduce<Accept[]>((carry, accept) => {
        if (accept.blockchain === currentBlockchain) {
          let existed: Accept | undefined;

          if (isBitcoinAccept(accept)) {
            existed = carry.find(({ symbol }) => symbol === accept.symbol);
          } else {
            existed = carry
              .filter((accept): accept is EthereumAccept => isEthereumAccept(accept))
              .find(({ contractAddress, symbol }) => {
                if (contractAddress == null) {
                  return symbol === accept.symbol;
                }

                return contractAddress === accept.contractAddress;
              });
          }

          if (existed == null) {
            return [...carry, accept];
          }
        }

        return carry;
      }, []),
    [accepted, currentBlockchain],
  );

  const currentEntry = React.useMemo(
    () => accepted.find((item) => item.blockchain === currentBlockchain)?.entryId,
    [accepted, currentBlockchain],
  );

  const selectAsset = (asset: string): void => {
    if (EthereumAddress.isValid(asset)) {
      setCurrentAccept(
        accepted
          .filter((accept): accept is EthereumAccept => isEthereumAccept(accept))
          .find(({ contractAddress }) => contractAddress === asset),
      );
    } else {
      setCurrentAccept(accepted.find(({ symbol }) => symbol === asset));
    }
  };

  const selectBlockchain = (blockchain: BlockchainCode): void => {
    const accept = anyAccept(accepted, blockchain);

    setCurrentAccept(accept);
    setCurrentBlockchain(blockchain);
  };

  React.useEffect(() => {
    const accepts = accepted.filter((accept) => {
      if (accept.blockchain === currentBlockchain) {
        if (isBitcoinAccept(accept)) {
          return accept.symbol === currentAccept?.symbol;
        }

        if (isEthereumAccept(currentAccept)) {
          if (currentAccept.contractAddress == null) {
            return accept.symbol === currentAccept.symbol;
          }

          return accept.contractAddress === currentAccept.contractAddress;
        }
      }

      return false;
    });

    Promise.all(
      accepts.map(async (accept) => {
        if (isBitcoinAccept(accept)) {
          const { address } = await getXPubPositionalAddress(accept.entryId, accept.xpub, 'receive');

          return [address];
        }

        return accept.addresses;
      }),
    ).then((addresses) => {
      if (mounted.current) {
        const uniqueAddresses = [
          ...addresses.flat().reduce<Set<string>>((carry, address) => carry.add(address), new Set()),
        ];

        setAvailableAddresses(uniqueAddresses);
        setCurrentAddress(uniqueAddresses[0]);
      }
    });
  }, [accepted, currentAccept, currentBlockchain, getXPubPositionalAddress]);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  let qrCodeValue = currentAddress;

  if (
    isEthereumAccept(currentAccept) &&
    currentAccept.contractAddress != null &&
    tokenRegistry.hasAddress(currentBlockchain, currentAccept.contractAddress)
  ) {
    const token = tokenRegistry.byAddress(currentBlockchain, currentAccept.contractAddress);

    // TODO There is no standards for that, check later
    qrCodeValue = `${qrCodeValue}?erc20=${token.symbol}`;
  }

  const qrCode = useQRCode(qrCodeValue ?? '');

  return (
    <Page title="Request Cryptocurrency" leftIcon={<Back onClick={onCancel} />}>
      {wallet != null && <WalletReference balances={balances} wallet={wallet} walletIcon={walletIcon} />}
      <Grid container>
        <Grid item xs={8}>
          <Grid container className={styles.form}>
            <Grid item xs={9}>
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
            <Grid item xs={3}>
              {currentAccept != null && (
                <FormControl fullWidth>
                  <InputLabel id="coin-select-label">Coin</InputLabel>
                  <Select
                    disabled={availableAccepts.length <= 1}
                    labelId="coin-select-label"
                    value={
                      isBitcoinAccept(currentAccept) || currentAccept.contractAddress == null
                        ? currentAccept.symbol
                        : currentAccept.contractAddress
                    }
                    onChange={(event) => selectAsset(event.target.value as string)}
                  >
                    {availableAccepts.map((accept) =>
                      isBitcoinAccept(accept) || accept.contractAddress == null ? (
                        <MenuItem key={accept.symbol} value={accept.symbol}>
                          {accept.symbol}
                        </MenuItem>
                      ) : (
                        <MenuItem key={accept.contractAddress} value={accept.contractAddress}>
                          {accept.symbol}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>
              )}
            </Grid>
            <Grid item xs={9}>
              <FormControl fullWidth={true}>
                <InputLabel id="address-select-label">Address</InputLabel>
                {currentAddress != null && availableAddresses.includes(currentAddress) && (
                  <Select
                    disabled={availableAddresses.length <= 1}
                    labelId="address-select-label"
                    value={currentAddress}
                    onChange={(event) => setCurrentAddress(event.target.value as string)}
                  >
                    {availableAddresses.map((address) => (
                      <MenuItem key={address} value={address}>
                        <Address address={address} disableCopy={true} />
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>
            </Grid>
            {currentAddress != null && (
              <Grid item xs={3} className={styles.copy}>
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
    const balances = wallet == null ? [] : accounts.selectors.getWalletBalances(state, wallet);

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
                  symbol: Blockchains[blockchain].params.coinTicker,
                },
              ];
            }
          }

          if (address == null) {
            return carry;
          }

          const accepts = tokenRegistry
            .getPinned(blockchain)
            .reduce<Accept[]>((carry, { symbol, address: contractAddress }) => {
              if (address == null) {
                return carry;
              }

              return [
                ...carry,
                {
                  blockchain,
                  contractAddress,
                  symbol,
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
              symbol: Blockchains[blockchain].params.coinTicker,
            },
            ...accepts,
          ];
        }, []) ?? [];

    return {
      accepted,
      balances,
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
