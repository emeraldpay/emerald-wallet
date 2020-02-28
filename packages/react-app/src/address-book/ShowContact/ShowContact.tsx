import { Account } from '@emeraldplatform/ui';
import { Pen1 as EditIcon, Trash as DeleteIcon } from '@emeraldplatform/ui-icons';
import { addressBook } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: '10px'
  }
};

interface Props {
  classes: any;
  address: any;
  onDeleteAddress?: any;
  onEditAddress?: any;
}

export const ShowContact = ({
  address, onDeleteAddress, onEditAddress, classes
}: Props) => (
  <div className={classes.container}>
    <div>
      <CoinAvatar chain={address.blockchain} />
    </div>
    <div>
      <Account
        identity={true}
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
  (dispatch, ownProps: any) => ({
    openAddress: () => {
      // const address = ownProps.address;
      // dispatch(gotoScreen('address', address.get('address')));
    },
    onDeleteAddress: () => {
      const { address } = ownProps;
      dispatch(addressBook.actions.deleteContactAction(address.blockchain, address.address));
    }
  })
)(StyledShowContact);

export default Address;
