import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  TableCell,
  TableRow,
  Table,
  TableHead,
  TableBody,
  Grid, Tooltip
} from "@material-ui/core";
import {accounts, hdpathPreview, IState, triggers, hwkey} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {BlockchainCode, AnyCoinCode, HDPath, Blockchains, tokenAmount, amountDecoder} from "@emeraldwallet/core";
import HDPathCounter from "./HDPathCounter";
import {IAddressState} from "@emeraldwallet/store/lib/hdpath-preview/types";
import BeenhereIcon from '@material-ui/icons/Beenhere';
import ClearIcon from '@material-ui/icons/Clear';
import {SeedReference, isLedger} from "@emeraldpay/emerald-vault-core";
import {Wei} from "@emeraldpay/bigamount-crypto";
import {BigAmount} from "@emeraldpay/bigamount";
import {isIdSeedReference} from "@emeraldpay/emerald-vault-core/lib/types";


const useStyles = makeStyles(
  createStyles({
    inactiveCheck: {
      color: '#d0d0d0'
    }
  })
);

const BASE_HD_PATH: HDPath = HDPath.parse("m/44'/0'/0'/0/0");

/**
 *
 */
const Component = (({disabledAccounts, table, setAccount, onStart}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [initialized, setInitialized] = React.useState();

  let start = 0;
  while (disabledAccounts.indexOf(start) >= 0) {
    start++;
  }

  //somehow need to initialize load on init
  setTimeout(() => {
    if (!initialized) {
      onStart();
    }
    if (table.length == 0 && !initialized) {
      setAccount(start);
      setInitialized(true);
    }
  }, 100);

  function isActive(item: IAddressState): boolean {
    const amountReader = amountDecoder(item.blockchain);
    return typeof item.balance == 'string' && amountReader(item.balance).isPositive();
  }

  function renderBalance(item: IAddressState): string {
    if (typeof item.balance != 'string' || item.balance.length == 0) {
      return "";
    }
    const amountReader = amountDecoder<BigAmount>(item.blockchain);
    const amount = amountReader(item.balance);
    return amount.toString();
  }

  let prev: IAddressState | undefined = undefined;

  function isChanged(item: IAddressState): boolean {
    return typeof prev == "undefined" || prev.blockchain != item.blockchain || prev.hdpath != item.hdpath || prev.address != item.address
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <HDPathCounter base={BASE_HD_PATH.toString()}
                     start={start}
                     disabled={disabledAccounts}
                     onChange={(path: HDPath) => setAccount(path.account)}/>
    </Grid>
    <Grid item={true} xs={12}>
      <Table size={"small"}>
        <TableHead>
          <TableRow>
            <TableCell>Blockchain</TableCell>
            <TableCell>HD Path</TableCell>
            <TableCell>Address</TableCell>
            <TableCell align={"right"}>Balance</TableCell>
            <TableCell>Coin</TableCell>
            <TableCell>In use</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table.map((item) => {
            const el = <TableRow key={item.blockchain + "-" + item.address + "-" + item.asset}>
              <TableCell>{isChanged(item) ? Blockchains[item.blockchain].getTitle() : ""}</TableCell>
              <TableCell>{isChanged(item) ? item.hdpath : ""}</TableCell>
              <TableCell>{isChanged(item) ? item.address : ""}</TableCell>
              <TableCell align={"right"}>{renderBalance(item)}</TableCell>
              <TableCell>{item.asset}</TableCell>
              <TableCell>
                <Tooltip title={isActive(item) ? "You had used this address before" : "New inactive address"}>
                  {isActive(item) ? <BeenhereIcon/> : <ClearIcon className={styles.inactiveCheck}/>}
                </Tooltip>
              </TableCell>
            </TableRow>
            prev = item;
            return el;
          })}
        </TableBody>
      </Table>
    </Grid>
  </Grid>
})

// State Properties
type Props = {
  disabledAccounts: number[],
  table: IAddressState[],
  isHWKey: boolean;
}
// Actions
type Actions = {
  setAccount: (account: number) => void,
  onStart: () => void;
}

// Component properties
type OwnProps = {
  seed: SeedReference,
  blockchains: BlockchainCode[],
  onChange: (account: number) => void,
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    let seed: SeedReference = ownProps.seed;
    let isHWSeed = false;
    // if ledger seed, check if it's already used
    if (isLedger(seed)) {
      isHWSeed = true;
      let ledgerSeed = accounts.selectors.findLedgerSeed(state);
      if (ledgerSeed?.id) {
        seed = {
          type: "id",
          value: ledgerSeed.id
        }
      }
    } else if (isIdSeedReference(seed)) {
      const details = accounts.selectors.getSeed(state, seed.value);
      isHWSeed = details?.type == "ledger";
    }

    return {
      disabledAccounts: seed.type == "id" ?
        accounts.selectors.allWallets(state)
          .filter((w) => typeof w.reserved !== 'undefined')
          .map((w) => w.reserved!.map((r) => r.accountId))
          .reduce((result, c) => result.concat(c), [])
        : [],
      table: hdpathPreview.selectors.getCurrentDisplay(state, seed),
      isHWKey: isHWSeed
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onStart: () => {
        dispatch(hdpathPreview.actions.init(ownProps.blockchains, ownProps.seed));
        dispatch(hwkey.actions.setWatch(true));
      },
      setAccount: (account: number) => {
        dispatch(hdpathPreview.actions.displayAccount(account));
        dispatch(hdpathPreview.actions.loadAddresses(
          ownProps.seed,
          account,
          ownProps.blockchains
        ));
        ownProps.onChange(account);
      }
    }
  }
)((Component));