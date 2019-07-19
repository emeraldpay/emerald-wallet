import React from 'react';
import withStyles from 'react-jss';
import { connect } from 'react-redux';
import { CoinAvatar} from '@emeraldwallet/ui';
import { Account } from '@emeraldplatform/ui';
import { Trash as DeleteIcon, Pen1 as EditIcon } from '@emeraldplatform/ui-icons';
import IconButton from '@material-ui/core/IconButton';
import { addressBook } from '../../../store';


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
  address, onDeleteAddress, onEditAddress, classes,
}) => (
  <div className={classes.container}>
    <div>
      <CoinAvatar chain={address.blockchain} />
    </div>
    <div>
      <Account
        identity
        address={address.address}
        name={address.name}
      />
    </div>
    <div>
      <IconButton onClick={onDeleteAddress}>
        <DeleteIcon />
      </IconButton>
      {/* <IconButton onClick={onEditAddress}> */}
      {/*  <EditIcon /> */}
      {/* </IconButton> */}
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
    onDeleteAddress: () => {
      const { address } = ownProps;
      dispatch(addressBook.actions.deleteContactAction(address.blockchain, address.address));
    },
  })
)(StyledShowContact);

export default Address;
