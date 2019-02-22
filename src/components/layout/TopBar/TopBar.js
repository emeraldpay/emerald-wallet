import React from 'react';
import withStyles from 'react-jss';
import { connect } from 'react-redux';
import Button from 'components/common/Button';
import { Add as AddIcon } from '@emeraldplatform/ui-icons';
import Screen from '../../../store/wallet/screen';

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};

/**
 * First dumb implementation of TopBar
 */
export class TopBar extends React.Component {
  render() {
    const {
      onAccounts, onNewContact, classes,
    } = this.props;
    return (
      <div className={classes.container}>
        <div>
          <Button
            label="ACCOUNTS"
            onClick={onAccounts}
          />
        </div>
        <div>
          <Button
            label="NEW CONTACT"
            icon={<AddIcon />}
            onClick={onNewContact}
          />
        </div>
      </div>
    );
  }
}

const StyledTopBar = withStyles(styles)(TopBar);

const mapDispatchToProps = (dispatch) => ({
  onAccounts: () => dispatch(Screen.actions.gotoScreen('home')),
  onNewContact: () => dispatch(Screen.actions.gotoScreen('add-address')),
});

export default connect(null, mapDispatchToProps)(StyledTopBar);
