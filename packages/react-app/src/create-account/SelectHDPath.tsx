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
  TableBody
} from "@material-ui/core";
import {accounts, hdpathPreview, IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {BlockchainCode, AnyCoinCode, HDPath, Blockchains, Units} from "@emeraldwallet/core";
import HDPathCounter from "./HDPathCounter";
import {IAddressState, SourceSeed} from "@emeraldwallet/store/lib/hdpath-preview/types";
import {Wei} from "@emeraldplatform/eth";
import BeenhereIcon from '@material-ui/icons/Beenhere';
import ClearIcon from '@material-ui/icons/Clear';

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
const Component = (({disabledAccounts, table, setAccount}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [initialized, setInitialized] = React.useState();

  let start = 0;
  while (disabledAccounts.indexOf(start) >= 0) {
    start++;
  }

  //somehow need to initialize load on init
  setTimeout(() => {
    if (table.length == 0 && !initialized) {
      setAccount(start);
      setInitialized(true);
    }
  }, 100);

  function isActive(item: IAddressState): boolean {
    return typeof item.balance == 'string' && item.balance.length > 0 && item.balance != "0";
  }

  function renderBalance(item: IAddressState): string {
    if (typeof item.balance != 'string' || item.balance.length == 0) {
      return "";
    }
    if (item.asset == "ETH" || item.asset == "ETC") {
      const wei = new Wei(item.balance);
      return wei.toString(wei.getUnit(2), 2, true);
    } else if (item.asset == "USDT") {
      const unit = new Units(item.balance, 6);
      return unit.toString() + " Tether";
    } else if (item.asset == "DAI") {
      const unit = new Units(item.balance, 18);
      return unit.toString() + " Dai";
    }
    return item.balance;
  }

  return <Card>
    <CardHeader action={
      <HDPathCounter base={BASE_HD_PATH.toString()}
                     start={start}
                     disabled={disabledAccounts}
                     onChange={(path: HDPath) => setAccount(path.account)}/>
    }/>
    <CardContent>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Blockchain</TableCell>
            <TableCell>HD Path</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Balance</TableCell>
            <TableCell>Coin</TableCell>
            <TableCell>In use</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table.map((item) => (
            <TableRow key={item.blockchain + "-" + item.address + "-" + item.asset}>
              <TableCell>{Blockchains[item.blockchain].getTitle()}</TableCell>
              <TableCell>{item.hdpath}</TableCell>
              <TableCell>{item.address}</TableCell>
              <TableCell align={"right"}>{renderBalance(item)}</TableCell>
              <TableCell>{item.asset}</TableCell>
              <TableCell>
                {isActive(item) ? <BeenhereIcon/> : <ClearIcon className={styles.inactiveCheck}/>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
})

// State Properties
type Props = {
  disabledAccounts: number[],
  table: IAddressState[]
}
// Actions
type Actions = {
  setAccount: (account: number) => void,
}

// Component properties
type OwnProps = {
  seed: SourceSeed,
  blockchains: BlockchainCode[],
  onChange: (account: number) => void,
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {
      disabledAccounts: accounts.selectors.allWallets(state)
        .filter((w) => typeof w.hdAccount == 'number')
        .map((w) => w.hdAccount!),
      table: hdpathPreview.selectors.getCurrentDisplay(state, ownProps.seed)
        .filter((item) => ownProps.blockchains.indexOf(item.blockchain) >= 0)
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      setAccount: (account: number) => {
        dispatch(hdpathPreview.actions.displayAccount(account));
        dispatch(hdpathPreview.actions.loadAddresses(
          ownProps.seed,
          BASE_HD_PATH.forAccount(account).toString(),
          ownProps.blockchains
        ));
        ownProps.onChange(account);
      }
    }
  }
)((Component));