import React from 'react';
import withStyles from 'react-jss';
import { connect } from 'react-redux';
import { Account } from '@emeraldplatform/ui';
import { Trash as DeleteIcon, Pen1 as EditIcon } from '@emeraldplatform/ui-icons';
import IconButton from '@material-ui/core/IconButton';
import { screen } from '../../../store';
import Addressbook from '../../../store/vault/addressbook';

const { gotoScreen } = screen.actions;

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: '10px',
  },
};

export const ShowContact = ({
  address, onDeleteAddress, onEditAddress, muiTheme, classes,
}) => (
  <div className={classes.container}>
    <div>
      <Account
        identity
        address={address.get('address')}
        name={address.get('name')}
      />
    </div>
    <div>
      <IconButton onClick={onDeleteAddress}>
        <DeleteIcon />
      </IconButton>
      <IconButton onClick={onEditAddress}>
        <EditIcon />
      </IconButton>
    </div>
  </div>
);

const StyledShowContact = withStyles(styles)(ShowContact);

const Address = connect(
  (state, ownProps) => ({
  }),
  (dispatch, ownProps) => ({
    openAddress: () => {
      // const address = ownProps.address;
      // dispatch(gotoScreen('address', address.get('address')));
    },
    onDeleteAddress: () => new Promise((resolve, reject) => {
      const { address } = ownProps;
      dispatch(Addressbook.actions.deleteAddress(address.get('address')))
        .then((response) => {
          dispatch(gotoScreen('address-book'));
          resolve(response);
        });
    }),
  })
)(StyledShowContact);

export default Address;
