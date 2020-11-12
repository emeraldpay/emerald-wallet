import {connect} from "react-redux";
import {Dispatch, ReactElement} from "react";
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
  Grid, Tooltip, Typography
} from "@material-ui/core";
import {accounts, hdpathPreview, IState, triggers, hwkey} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {BlockchainCode, AnyCoinCode, HDPath, Blockchains, tokenAmount, amountDecoder} from "@emeraldwallet/core";
import HDPathCounter from "./HDPathCounter";
import {IAddressState} from "@emeraldwallet/store/lib/hdpath-preview/types";
import BeenhereIcon from '@material-ui/icons/Beenhere';
import ClearIcon from '@material-ui/icons/Clear';
import {SeedReference, isLedger} from "@emeraldpay/emerald-vault-core";
import {BigAmount} from "@emeraldpay/bigamount";
import {Skeleton} from "@material-ui/lab";
import {Address} from "@emeraldwallet/ui";


const useStyles = makeStyles(
  createStyles({
    inactiveCheck: {
      color: '#d0d0d0'
    },
    balanceSkeleton: {
      float: "right"
    },
    addressSkeleton: {
      paddingTop: "4px",
      paddingLeft: "4px"
    }
  })
);

const BASE_HD_PATH: HDPath = HDPath.parse("m/44'/0'/0'/0/0");

/**
 *
 */
const Component = (({disabledAccounts, table, onAccountUpdate, onStart, onReady, isHWKey, isPreloaded, initAccountId}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [initialized, setInitialized] = React.useState();

  const [accountId, setAccountId] = React.useState(initAccountId);

  const ready = !isHWKey || isPreloaded;
  const addresses: Partial<Record<BlockchainCode, string>> = {};
  table.forEach((e) => {
    if (e.xpub || e.address) {
      addresses[e.blockchain] = e.xpub || e.address
    }
  });

  React.useEffect(() => {
    if (!initialized) {
      onStart();
      onAccountUpdate(accountId, ready, addresses);
      setInitialized(true);
    }
  }, []);

  React.useEffect(() => {
    onReady(accountId, ready, addresses);
  }, [isHWKey, isPreloaded]);

  function isActive(item: IAddressState): boolean {
    const amountReader = amountDecoder(item.blockchain);
    return typeof item.balance == 'string' && amountReader(item.balance).isPositive();
  }

  function renderBalance(item: IAddressState): ReactElement {
    if (typeof item.balance != 'string' || item.balance.length == 0) {
      return <Skeleton variant={"text"} width={80} height={12} className={styles.balanceSkeleton}/>;
    }
    const amountReader = amountDecoder<BigAmount>(item.blockchain);
    const amount = amountReader(item.balance);
    return <Typography>{amount.toString()}</Typography>;
  }

  let prev: IAddressState | undefined = undefined;

  function isChanged(item: IAddressState): boolean {
    return typeof prev == "undefined" || prev.blockchain != item.blockchain || prev.hdpath != item.hdpath || prev.address != item.address
  }

  function address(value: string | undefined | null, blockchain: BlockchainCode): ReactElement {
    if (typeof value == "string" && value.length > 0) {
      return <Address address={value} disableCopy={true}/>;
    }
    if (isHWKey) {
      const appTitle = Blockchains[blockchain].getTitle();
      return <Skeleton variant={"text"} width={400} height={20} className={styles.addressSkeleton}>Open {appTitle} App
        on Ledger</Skeleton>
    }
    return <Skeleton variant={"text"} width={400} height={12}/>
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}>
      <HDPathCounter base={BASE_HD_PATH.toString()}
                     start={accountId}
                     disabled={disabledAccounts}
                     onChange={(path: HDPath) => {
                       setAccountId(path.account);
                       onAccountUpdate(path.account, ready, addresses);
                     }}/>
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
              <TableCell>{isChanged(item) ? address(item.address, item.blockchain) : ""}</TableCell>
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
  isPreloaded: boolean;
  initAccountId: number;
}
// Actions
type Actions = {
  onAccountUpdate: (account: number, ready: boolean, addresses: Partial<Record<BlockchainCode, string>>) => void,
  onReady: (account: number, ready: boolean, addresses: Partial<Record<BlockchainCode, string>>) => void,
  onStart: () => void;
}

// Component properties
type OwnProps = {
  seed: SeedReference,
  blockchains: BlockchainCode[],
  onChange: (account: number | undefined, addresses: Partial<Record<BlockchainCode, string>>) => void,
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    let seed: SeedReference = ownProps.seed;
    let isHWSeed = accounts.selectors.isHardwareSeed(state, seed);

    // if ledger seed, check if it's already used and get id
    if (isHWSeed && isLedger(seed)) {
      let ledgerSeed = accounts.selectors.findLedgerSeed(state);
      if (ledgerSeed?.id) {
        seed = {
          type: "id",
          value: ledgerSeed.id
        }
      }
    }

    const disabledAccounts = seed.type == "id" ?
      accounts.selectors.allWallets(state)
        .filter((w) => typeof w.reserved !== 'undefined')
        .map((w) => w.reserved!.map((r) => r.accountId))
        .reduce((result, c) => result.concat(c), [])
      : [];

    let accountId = 0;
    while (disabledAccounts.indexOf(accountId) >= 0) {
      accountId++;
    }

    return {
      disabledAccounts,
      table: hdpathPreview.selectors.getCurrentDisplay(state, seed),
      isHWKey: isHWSeed,
      isPreloaded: hdpathPreview.selectors.isPreloaded(state),
      initAccountId: accountId
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onStart: () => {
        dispatch(hdpathPreview.actions.init(ownProps.blockchains, ownProps.seed));
        dispatch(hdpathPreview.actions.displayAccount(0));
        dispatch(hwkey.actions.setWatch(true));
      },
      onAccountUpdate: (account: number, ready: boolean, addresses: Partial<Record<BlockchainCode, string>>) => {
        dispatch(hdpathPreview.actions.displayAccount(account));
        ownProps.onChange(ready ? account : undefined, addresses);
      },
      onReady: (account: number, ready: boolean, addresses: Partial<Record<BlockchainCode, string>>) => {
        ownProps.onChange(ready ? account : undefined, addresses);
      }
    }
  }
)((Component));