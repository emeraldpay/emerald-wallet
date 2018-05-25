import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import log from 'electron-log';
import { TableRowColumn, TableRow } from 'material-ui/Table';
import { tables } from 'lib/styles';
import { Address as AccountAddress } from 'emerald-js-ui';
import AccountBalance from '../../accounts/Balance';


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

const Addr = ({ addr, alreadyAdded, selectedValue, onSelected, ...otherProps }) => {
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

  return (
    <TableRow {...otherProps} selectable={ false }>
      <TableRowColumn style={tables.wideStyle}>
        <div style={ style.addrContainer }>
          <div>
            { address &&
                        <RadioButtonGroup name="addrRadio" valueSelected={ selectedValue } onChange={ onSelected }>
                          <RadioButton
                            disabled={ !selectable }
                            value={ address }
                          />
                        </RadioButtonGroup> }
          </div>
          <div>
            { address && <AccountAddress id={ address }/> }
          </div>
        </div>
      </TableRowColumn>
      <TableRowColumn style={tables.mediumStyle}>{ addr.get('hdpath') }</TableRowColumn>
      <TableRowColumn style={tables.mediumStyle}>
        {balance && <AccountBalance
          symbol="ETC"
          balance={ balance }
          showFiat={ true }
          withAvatar={ false }
        />}
      </TableRowColumn>
      <TableRowColumn style={tables.shortStyle}>
        {usedLabel}
      </TableRowColumn>
    </TableRow>
  );
};

Addr.propTypes = {
};

export default connect(
  (state, ownProps) => {
    const accounts = state.accounts.get('accounts');
    const addr = ownProps.addr;
    let alreadyAdded = false;
    try {
      const addrId = (addr.get('address') || '---R').toLowerCase();
      alreadyAdded = accounts.some((a) => a.get('id', '---L').toLowerCase() === addrId);
    } catch (e) {
      log.error(e);
    }
    return {
      alreadyAdded,
      addr,
    };
  },
  (dispatch, ownProps) => ({
    onSelected: (event, value) => {
      ownProps.onSelected(value);
    },
  })
)(Addr);
