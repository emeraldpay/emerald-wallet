import { blockchainIdToCode, PersistentState } from '@emeraldwallet/core';
import { addressBook } from '@emeraldwallet/store';
import { Account, CoinAvatar, Trash as DeleteIcon } from '@emeraldwallet/ui';
import { createStyles, withStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import * as React from 'react';
import { connect } from 'react-redux';

const styles = createStyles({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: '10px',
  },
});

interface OwnProps {
  contact: PersistentState.AddressbookItem;
  onEditAddress?: () => void;
}

interface DispatchProps {
  onDeleteAddress: () => void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const ShowContact: React.FC<OwnProps & DispatchProps & StylesProps> = ({
  classes,
  contact,
  onDeleteAddress,
  onEditAddress,
}) => {
  return (
    <div className={classes.container}>
      <div>
        <CoinAvatar chain={blockchainIdToCode(contact.blockchain)} />
      </div>
      <div>
        <Account identity={true} address={contact.address.address} name={contact.label} />
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
};

export default connect<{}, DispatchProps, OwnProps>(null, (dispatch, ownProps) => ({
  onDeleteAddress: () => {
    const {
      contact: { blockchain, id },
    } = ownProps;

    dispatch(addressBook.actions.deleteContactAction(blockchainIdToCode(blockchain), id as string));
  },
}))(withStyles(styles)(ShowContact));
