import * as React from 'react';
import withStyles from 'react-jss';
import { connect } from 'react-redux';
import { Button } from '@emeraldwallet/ui';
import { Add as AddIcon } from '@emeraldplatform/ui-icons';
import { screen } from '@emeraldwallet/store';
import { Action, Dispatch } from "redux";

export const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
};

interface Props {
  onAccounts?: any;
  onNewContact?: any;
  classes: any;
}

/**
 * First dumb implementation of TopBar
 */
export class TopBar extends React.Component<Props> {
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

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  onAccounts: () => dispatch(screen.actions.gotoScreen('home')),
  onNewContact: () => dispatch(screen.actions.gotoScreen('add-address')),
});

export default connect(null, mapDispatchToProps)(StyledTopBar);
