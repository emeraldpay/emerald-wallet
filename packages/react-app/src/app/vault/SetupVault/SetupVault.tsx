import { screen } from '@emeraldwallet/store';
import { Page } from '@emeraldwallet/ui';
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { FiberNew as SetupIcon, Restore as RestoreIcon } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';

interface DispatchProps {
  goToCreate(): Promise<void>;
  goToImport(): Promise<void>;
}

class SetupVault extends React.Component<DispatchProps> {
  render(): React.ReactNode {
    return (
      <Page title="Setup">
        <List onClick={this.props.goToCreate}>
          <ListItem>
            <ListItemIcon>
              <SetupIcon />
            </ListItemIcon>
            <ListItemText primary="New setup" secondary="Setup new Emerald Wallet instance" />
          </ListItem>
        </List>
        <List onClick={this.props.goToImport}>
          <ListItem>
            <ListItemIcon>
              <RestoreIcon />
            </ListItemIcon>
            <ListItemText
              primary="Restore from backup"
              secondary="Import vault file and restore previously created Emerald Wallet instance"
            />
          </ListItem>
        </List>
      </Page>
    );
  }
}

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    goToCreate() {
      return dispatch(screen.actions.gotoScreen(screen.Pages.GLOBAL_KEY));
    },
    goToImport() {
      return dispatch(screen.actions.gotoScreen(screen.Pages.IMPORT_VAULT));
    },
  }),
)(SetupVault);
