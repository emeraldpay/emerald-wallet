import React from 'react';
import { connect } from 'react-redux';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Account } from 'emerald-js-ui';
import { Trash as DeleteIcon } from 'emerald-js-ui/lib/icons3';
import { IconButton } from 'material-ui';
import { gotoScreen } from '../../../store/wallet/screen/screenActions';
import Addressbook from '../../../store/vault/addressbook';

import styles from './Contact.scss';

const Render = ({ address, onDeleteAddress, muiTheme }) => (
  <div className={styles.container}>
    <div>
      <Account
        identity
        addr={address.get('address')}
        name={address.get('name')}
      />
    </div>
    <div>
      <IconButton onClick={onDeleteAddress}>
        <DeleteIcon style={{color: muiTheme.palette.secondaryTextColor}}/>
      </IconButton>
    </div>
  </div>
);

const Address = connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    openAddress: () => {
      // const address = ownProps.address;
      // dispatch(gotoScreen('address', address.get('address')));
    },
    onDeleteAddress: () => new Promise((resolve, reject) => {
      const address = ownProps.address;
      dispatch(Addressbook.actions.deleteAddress(address.get('address')))
        .then((response) => {
          dispatch(gotoScreen('address-book'));
          resolve(response);
        });
    }),
  })
)(Render);

export default muiThemeable()(Address);
