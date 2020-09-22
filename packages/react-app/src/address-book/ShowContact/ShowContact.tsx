import {Account} from '@emeraldplatform/ui';
import {Pen1 as EditIcon, Trash as DeleteIcon} from '@emeraldplatform/ui-icons';
import {addressBook, IState} from '@emeraldwallet/store';
import {CoinAvatar} from '@emeraldwallet/ui';
import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import {connect} from 'react-redux';
import {AddressBookItem} from '@emeraldpay/emerald-vault-core';
import {blockchainIdToCode} from "@emeraldwallet/core";
import {makeStyles} from "@material-ui/core/styles";
import {createStyles, Theme} from "@material-ui/core";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'white',
      padding: '10px'
    }
  })
);

const ShowContact = (({address, onDeleteAddress, onEditAddress}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <div className={styles.container}>
    <div>
      <CoinAvatar chain={blockchainIdToCode(address.blockchain)}/>
    </div>
    <div>
      <Account
        identity={true}
        address={address.address.value}
        name={address.name}
      />
    </div>
    <div>
      <IconButton onClick={onDeleteAddress}>
        <DeleteIcon/>
      </IconButton>
      {/* <IconButton onClick={onEditAddress}> */}
      {/*  <EditIcon /> */}
      {/* </IconButton> */}
    </div>
  </div>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
  onDeleteAddress: () => void;
}

// Component properties
interface OwnProps {
  address: AddressBookItem;
  onEditAddress?: () => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch, ownProps: OwnProps): Actions => ({
    onDeleteAddress: () => {
      const {address} = ownProps;
      dispatch(addressBook.actions.deleteContactAction(blockchainIdToCode(address.blockchain), address.address.value));
    },
  })
)(ShowContact);