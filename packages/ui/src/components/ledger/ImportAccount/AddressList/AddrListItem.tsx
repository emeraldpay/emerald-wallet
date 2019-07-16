import * as React from 'react';
import {withStyles} from '@material-ui/styles';
import Radio from '@material-ui/core/Radio';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {Address as AccountAddress} from '@emeraldplatform/ui';

import {styles as tableStyles} from './styles';
import {LedgerAddress, Selectable} from './types';
import {IApi, blockchainByName} from "@emeraldwallet/core";
import {Wei} from "@emeraldplatform/eth";
import Balance from "../../../accounts/Balance/Balance";
import BigNumber from "bignumber.js";

const style = {
  used: {
    color: '#999',
  },
  usedIcon: {
    fontSize: '14px',
  },
  addrContainer: {
    display: 'flex',
    alignItems: 'center',
  },
};

interface Props {
  addr?: LedgerAddress & Selectable;
  classes?: any;
  onSelected?: any;
  alreadyAdded?: any;
  blockchain?: string;
  api: IApi;
}

interface State {
  balance: Wei
}

class Addr extends React.Component<Props, State> {

  constructor(props: Readonly<Props>) {
    super(props);
    this.state = {balance: Wei.ZERO}
  }

  handleSelected = (event: any, checked: boolean) => {
    if (checked && this.props.onSelected) {
      this.props.onSelected(event.target.value);
    }
  };

  componentDidMount(): void {
    this.loadBalance();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any): void {
    this.loadBalance();
  }

  loadBalance(): void {
    const blockchain = this.props.blockchain;
    if (!blockchain || !this.props.addr || !this.props.addr.address) {
      return;
    }
    const address = this.props.addr.address;
    this.props.api.chain(blockchain).eth.getBalance(address)
      .then((balance: BigNumber) => {
        const newBalance = new Wei(balance);
        if (!newBalance.equals(this.state.balance)) {
          this.setState({balance: newBalance});
        }
      })
      .catch((e) => console.error(`Unable to load balance for ${address} on ${blockchain}`, e));
  }

  render() {
    const {
      addr, alreadyAdded, classes, blockchain
    } = this.props;
    let usedLabel;

    if (alreadyAdded) {
      usedLabel = 'Imported';
    } else if (addr.txcount > 0) {
      usedLabel = 'Used';
    } else {
      usedLabel = 'New';
    }

    const hasPath = addr.hdpath !== null;
    const hasAddr = addr.address !== null;
    const selectable = hasPath && hasAddr && !alreadyAdded;
    const {balance} = this.state;

    let balanceRender = null;
    if (balance) {
      balanceRender = <Balance symbol={blockchainByName(blockchain).params.coinTicker} balance={balance} showFiat={false} decimals={3} />;
    }

    return (
      <TableRow>
        <TableCell className={classes.wideStyle}>
          <div style={style.addrContainer}>
            <div>
              {addr.address
              && <Radio
                checked={addr.selected}
                disabled={!selectable}
                value={addr.address}
                onChange={this.handleSelected}
              />}
            </div>
            <div>
              {addr.address && <AccountAddress id={addr.address} showCheck={false}/>}
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.mediumStyle}>{addr.hdpath}</TableCell>
        <TableCell className={classes.mediumStyle}>
          {balanceRender}
        </TableCell>
        <TableCell className={classes.shortStyle}>
          {usedLabel}
        </TableCell>
      </TableRow>
    );
  }
}

export default withStyles(tableStyles)(Addr);
