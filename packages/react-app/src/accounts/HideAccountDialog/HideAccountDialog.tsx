import {
  Warning, WarningHeader, WarningText
} from '@emeraldplatform/ui';
import { addresses, screen } from '@emeraldwallet/store';
import { Button } from '@emeraldwallet/ui';
import Dialog from '@material-ui/core/Dialog';
import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';

export const styles = {
  title: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '24px',
    textTransform: 'uppercase'
  } as CSSProperties
};

interface Props {
  onClose?: any;
  handleConfirmHide?: any;
  classes: any;
}

export class HideAccountDialog extends React.Component<Props> {
  public render () {
    const {
      onClose, handleConfirmHide, classes
    } = this.props;

    return (
      <Dialog open={true} onClose={onClose}>
        <div style={{ maxWidth: '600px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className={classes.title}>Are you Sure you want to hide this account?</div>
          </div>
          <div style={{ marginRight: '20px' }}>
            <Warning>
              <WarningHeader>Hiding accounts will NOT delete your account key files.</WarningHeader>
              <WarningText>This will only hide the account. If you really need to delete an account on disk, you can use Emerald-CLI, or manually delete the account key files from the computer's file system.</WarningText>
            </Warning>
          </div>
          <Button
            style={{
              marginTop: '10px'
            }}
            label='CANCEL'
            onClick={onClose}
          />
          <Button
            style={{
              marginLeft: '10px',
              marginTop: '10px'
            }}
            label='HIDE'
            primary={true}
            onClick={handleConfirmHide}
          />
        </div>
      </Dialog>);
  }
}

const StyledHideAccountDialog = withStyles(styles)(HideAccountDialog);

export default connect(
  (state, ownProps: any) => ({
  }),
  (dispatch, ownProps) => ({
    handleConfirmHide: () => {
      dispatch(addresses.actions.hideAccount(ownProps.account) as any);

      // refresh account data
      // TODO: do we need it ???
      // dispatch(history.actions.refreshTrackedTransactions());
      // dispatch(accounts.actions.loadAccountsList());
      // dispatch(accounts.actions.loadPendingTransactions());
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(StyledHideAccountDialog);
