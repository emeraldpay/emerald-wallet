import * as React from 'react';
import {withStyles} from '@material-ui/styles';
import Radio from '@material-ui/core/Radio';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {Address as AccountAddress} from '@emeraldplatform/ui';

import {styles as tableStyles} from './styles';
import {LedgerAddress, Selectable} from './types';

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
  balanceRender?: any;
}

class Addr extends React.Component<Props> {

  handleSelected = (event: any, checked: boolean) => {
    if (checked && this.props.onSelected) {
      this.props.onSelected(event.target.value);
    }
  };

  render() {
    const {
      addr, alreadyAdded, classes,
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
    const balance = addr.value;
    const balanceRender = this.props.balanceRender || ((b) => JSON.stringify(b));
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
              {addr.address && <AccountAddress id={addr.address}/>}
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.mediumStyle}>{addr.hdpath}</TableCell>
        <TableCell className={classes.mediumStyle}>
          {balance && balanceRender(balance)}
        </TableCell>
        <TableCell className={classes.shortStyle}>
          {usedLabel}
        </TableCell>
      </TableRow>
    );
  }
}

export default withStyles(tableStyles)(Addr);
