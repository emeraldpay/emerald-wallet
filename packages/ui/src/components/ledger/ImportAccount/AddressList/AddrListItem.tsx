import * as React from 'react';
import {withStyles} from '@material-ui/styles';
import Radio from '@material-ui/core/Radio';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {Address as AccountAddress} from '@emeraldplatform/ui';

import {styles as tableStyles} from './styles';


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
  addr?: any;
  classes?: any;
  onSelected?: any;
  alreadyAdded?: any;
  selectedValue?: any;
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
      addr, alreadyAdded, selectedValue, classes,
    } = this.props;
    let usedLabel;

    if (alreadyAdded) {
      usedLabel = 'Imported';
    } else if (addr.get('txcount') > 0) {
      usedLabel = 'Used';
    } else {
      usedLabel = 'New';
    }

    const hasPath = addr.get('hdpath') !== null;
    const hasAddr = addr.get('address') !== null;
    const address = addr.get('address');
    const selectable = hasPath && hasAddr && !alreadyAdded;
    const balance = addr.get('value');
    const balanceRender = this.props.balanceRender || ((b) => JSON.stringify(b));
    return (
      <TableRow>
        <TableCell className={classes.wideStyle}>
          <div style={style.addrContainer}>
            <div>
              {address
              && <Radio
                checked={selectedValue === address}
                disabled={!selectable}
                value={address}
                onChange={this.handleSelected}
              />}
            </div>
            <div>
              {address && <AccountAddress id={address}/>}
            </div>
          </div>
        </TableCell>
        <TableCell className={classes.mediumStyle}>{addr.get('hdpath')}</TableCell>
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
