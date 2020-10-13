import {connect} from "react-redux";
import * as React from "react";
import {Dispatch} from "react";
import {
  createStyles,
  Theme,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box, Button,
} from "@material-ui/core";
import {accounts, IBalanceValue, IState, screen} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Page} from "@emeraldplatform/ui";
import {Back} from "@emeraldplatform/ui-icons";
import {Uuid, Wallet} from "@emeraldpay/emerald-vault-core";
import {AnyCoinCode, AnyTokenCode, BlockchainCode, Blockchains, blockchainIdToCode} from "@emeraldwallet/core";
import {WalletReference} from "@emeraldwallet/ui";
import {Address} from '@emeraldplatform/ui';
import {useQRCode} from 'react-qrcode';
import {registry} from "@emeraldwallet/erc20";
import {clipboard} from 'electron';
import LibraryAddCheckIcon from '@material-ui/icons/LibraryAddCheck';
import {CurrentAddress, isBitcoinEntry, isEthereumEntry} from "@emeraldpay/emerald-vault-core";
import {EntryId} from "@emeraldpay/emerald-vault-core/lib/types";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    form: {
      marginTop: "40px",
    },
    copyCell: {
      paddingTop: "18px",
      paddingLeft: "8px",
    }
  })
);


const distinct = (value: any, i: number, self: any[]) => {
  return self.indexOf(value) === i;
}

function anyToken(accepted: Accept[], blockchain: BlockchainCode): AnyCoinCode {
  return accepted.filter((it) => it.blockchain == blockchain)[0].token
}

function anyAddress(accepted: Accept[], blockchain: BlockchainCode, token: AnyCoinCode): string {
  return accepted.filter((it) => it.blockchain == blockchain && it.token == token)[0].addresses[0]
}


/**
 *
 */
const Component = (({wallet, assets, accepted, onCancel, onOk}: Props & Actions & OwnProps) => {
  const styles = useStyles();

  const availableBlockchains = accepted.map((accept) => accept.blockchain).filter(distinct);

  const [currBlockchain, setCurrBlockchain] = React.useState(availableBlockchains[0]);
  const [currCoin, setCurrCoin] = React.useState(anyToken(accepted, currBlockchain));
  const [currAddress, setCurrAddress] = React.useState(anyAddress(accepted, currBlockchain, currCoin));

  let qrValue = currAddress;
  const erc20 = registry.tokens[currBlockchain].find((token) => token.symbol == currCoin);
  if (typeof erc20 != "undefined") {
    //TODO there is no standards for that, check later
    qrValue = qrValue + "?erc20=" + erc20.symbol;
  }

  const qrCodeUrl = useQRCode(qrValue)

  function selectBlockchain(blockchain: BlockchainCode) {
    setCurrBlockchain(blockchain);
    const token = anyToken(accepted, blockchain)
    setCurrCoin(token);
    setCurrAddress(anyAddress(accepted, blockchain, token));
  }

  function selectToken(token: AnyCoinCode) {
    setCurrCoin(token);
    setCurrAddress(anyAddress(accepted, currBlockchain, token));
  }

  function findEntry(): EntryId {
    return accepted.find((a) => a.blockchain == currBlockchain && a.addresses.indexOf(currAddress) >= 0)!.entryId
  }

  const formBlockchain = <FormControl fullWidth={true}>
    <InputLabel id="blockchain-select-label">Blockchain</InputLabel>
    <Select labelId={"blockchain-select-label"}
            disabled={availableBlockchains.length == 1}
            value={currBlockchain}
            onChange={(e) => selectBlockchain(e.target.value as BlockchainCode)}>
      {availableBlockchains.map((blockchain) =>
        <MenuItem
          key={blockchain}
          value={blockchain}>
          {Blockchains[blockchain].getTitle()}
        </MenuItem>
      )}
    </Select>
  </FormControl>;

  const availableCoins = accepted
    .filter((it) => it.blockchain == currBlockchain)
    .map((it) => it.token)
    .filter(distinct);

  const formCoin = <FormControl fullWidth={true}>
    <InputLabel id="coin-select-label">Coin</InputLabel>
    <Select labelId={"coin-select-label"}
            value={currCoin}
            disabled={availableCoins.length == 1}
            onChange={(e) => selectToken(e.target.value as AnyCoinCode)}
    >
      {availableCoins.map((token) => <MenuItem key={token} value={token}>{token}</MenuItem>)}
    </Select>
  </FormControl>;

  const availableAddresses = accepted
    .filter((it) => it.blockchain == currBlockchain && it.token == currCoin)
    .map((it) => it.addresses)
    .reduce((buf: string[], address: string[]) => {
      buf.push(...address);
      return buf
    })
    .filter(distinct);

  const formAddress = <FormControl fullWidth={true}>
    <InputLabel id="address-select-label">Address</InputLabel>
    <Select labelId={"address-select-label"}
            value={currAddress}
            disabled={availableAddresses.length == 1}
            onChange={(e) => setCurrAddress(e.target.value as string)}
    >
      {availableAddresses.map((address) =>
        <MenuItem key={address} value={address}>
          <Address id={address} hideCopy={true}/>
        </MenuItem>
      )}
    </Select>
  </FormControl>

  const qr = <Box>
    <img src={qrCodeUrl} alt={""} width={250}/>
  </Box>

  return <Page title='Request Cryptocurrency'
               leftIcon={<Back onClick={onCancel}/>}>
    <WalletReference wallet={wallet} assets={assets}/>

    <Grid container={true}>
      <Grid item={true} xs={8}>
        <Grid container={true} className={styles.form}>
          <Grid item={true} xs={6}>
            {formBlockchain}
          </Grid>
          <Grid item={true} xs={3}>
            {formCoin}
          </Grid>
          <Grid item={true} xs={9}>
            {formAddress}
          </Grid>
          <Grid item={true} xs={1} className={styles.copyCell}>
            <Button onClick={() => clipboard.writeText(currAddress)}>
              <LibraryAddCheckIcon/>
              Copy
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item={true} xs={4}>
        {qr}
      </Grid>
    </Grid>
    <Grid item={true} xs={8}>
      <Button onClick={() => onCancel()}>Cancel</Button>
      <Button onClick={() => onOk(findEntry())} color={"primary"} variant={"contained"}>Save</Button>
    </Grid>
  </Page>
})

// State Properties
interface Props {
  wallet: Wallet;
  assets: IBalanceValue[];
  accepted: Accept[];
}

// Actions
interface Actions {
  onCancel: () => void;
  onOk: (entryId: EntryId) => void;
}

// Component properties
interface OwnProps {
  walletId: Uuid
}

interface Accept {
  blockchain: BlockchainCode;
  token: AnyCoinCode;
  addresses: string[];
  entryId: EntryId;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId)!;
    const assets: IBalanceValue[] = accounts.selectors.getWalletBalances(state, wallet, false);
    const accepted: Accept[] = [];
    wallet.entries.forEach((acc) => {
      let address: string | undefined = undefined;
      if (isEthereumEntry(acc)) {
        address = acc.address?.value
      } else if (isBitcoinEntry(acc)) {
        address = acc.addresses.find((a: CurrentAddress) => a.role = "receive")?.address;
      }
      if (typeof address == "undefined") {
        return
      }
      const blockchain = blockchainIdToCode(acc.blockchain);
      accepted.push({
        blockchain,
        token: Blockchains[blockchain].params.coinTicker,
        addresses: [address],
        entryId: acc.id,
      });
      Blockchains[blockchain].getAssets().forEach((token) => {
        accepted.push({
          blockchain,
          token,
          addresses: [address!],
          entryId: acc.id,
        });
      })
    })
    return {
      wallet,
      assets,
      accepted,
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onCancel: () => dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId)),
      onOk: (entryId: EntryId) => {
        dispatch(accounts.actions.nextAddress(entryId, "receive"));
        dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
      }
    }
  }
)((Component));