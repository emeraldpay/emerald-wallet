import { accounts, screen } from '@emeraldwallet/store';
import {
  AddCircle as AddCircleIcon,
  Book as BookIcon,
  Button,
  EmoteHappy as AboutIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
} from '@emeraldwallet/ui';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import * as React from 'react';
import { connect } from 'react-redux';
import { EmeraldDialogs } from '../../screen/Dialog/Dialog';

interface DispatchProps {
  gotoAbout(): void;
  gotoAddressBook(): void;
  gotoCreateWallet(): void;
  gotoSettings(): void;
  isGlobalKeySet(): Promise<boolean>;
}

const Component: React.FC<DispatchProps> = ({
  gotoAbout,
  gotoAddressBook,
  gotoCreateWallet,
  gotoSettings,
  isGlobalKeySet,
}) => {
  const [element, setElement] = React.useState<HTMLButtonElement | null>(null);
  const [globalKeySet, setGlobalKeySet] = React.useState(false);

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => setElement(event.currentTarget),
    [],
  );

  const handleClose = React.useCallback(() => setElement(null), []);

  React.useEffect(() => {
    (async () => {
      const hasGlobalKey = await isGlobalKeySet();

      setGlobalKeySet(hasGlobalKey);
    })();
  }, []);

  return (
    <div>
      <Button variant="text" primary={true} onClick={handleClick} icon={<MenuIcon />} />
      <Popover open={element != null} anchorEl={element} onClose={handleClose}>
        <List>
          <ListItem
            button={true}
            disabled={!globalKeySet}
            onClick={() => {
              handleClose();
              gotoAddressBook();
            }}
          >
            <ListItemIcon>
              <BookIcon />
            </ListItemIcon>
            <ListItemText primary="Address Book" secondary="View and edit contacts" />
          </ListItem>
          <ListItem
            button={true}
            disabled={!globalKeySet}
            onClick={() => {
              handleClose();
              gotoCreateWallet();
            }}
          >
            <ListItemIcon>
              <AddCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Create wallet" secondary="Create or import wallet" />
          </ListItem>
          <ListItem
            button={true}
            onClick={() => {
              handleClose();
              gotoSettings();
            }}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" secondary="Application settings" />
          </ListItem>
          <ListItem
            button={true}
            onClick={() => {
              handleClose();
              gotoAbout();
            }}
          >
            <ListItemIcon>
              <AboutIcon />
            </ListItemIcon>
            <ListItemText primary="About" secondary="Info about application" />
          </ListItem>
        </List>
      </Popover>
    </div>
  );
};

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    gotoAbout() {
      dispatch(screen.actions.showDialog(EmeraldDialogs.ABOUT));
    },
    gotoAddressBook() {
      dispatch(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
    },
    gotoCreateWallet() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_WALLET));
    },
    gotoSettings() {
      dispatch(screen.actions.gotoScreen('settings'));
    },
    isGlobalKeySet() {
      return dispatch(accounts.actions.isGlobalKeySet());
    },
  }),
)(Component);
