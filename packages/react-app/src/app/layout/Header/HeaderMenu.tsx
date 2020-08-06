import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {IState, screen} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Button} from "@emeraldwallet/ui";
import {Book as BookIcon, EmoteHappy as AboutIcon, Menu as MenuIcon} from "@emeraldplatform/ui-icons";
import Popover from "@material-ui/core/Popover";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {Settings as SettingsIcon} from '@emeraldplatform/ui-icons';
import {AddCircle as AddCircleIcon} from '@emeraldplatform/ui-icons';
import {EmeraldDialogs} from "../../screen/Dialog/Dialog";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({})
);

/**
 *
 */
const Component = (({onAddressBook, onAbout, onSettings, onCreateWallet}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return <div>
    <Button
      variant='text'
      primary={true}
      onClick={handleClick}
      icon={<MenuIcon/>}
    />
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
    >
      <List>
        <ListItem button={true}
                  onClick={() => {
                    handleClose();
                    onAddressBook();
                  }}>
          <ListItemIcon>
            <BookIcon/>
          </ListItemIcon>
          <ListItemText primary='Address Book' secondary='View and edit contacts'/>
        </ListItem>

        <ListItem button={true}
                  onClick={() => {
                    handleClose();
                    onCreateWallet();
                  }}>
          <ListItemIcon>
            <AddCircleIcon/>
          </ListItemIcon>
          <ListItemText primary='Create wallet' secondary='Create or import wallet'/>
        </ListItem>

        <ListItem button={true}
                  onClick={() => {
                    handleClose();
                    onSettings();
                  }}>
          <ListItemIcon>
            <SettingsIcon/>
          </ListItemIcon>
          <ListItemText primary='Settings' secondary='Application settings'/>
        </ListItem>

        <ListItem button={true}
                  onClick={() => {
                    handleClose();
                    onAbout();
                  }}>
          <ListItemIcon>
            <AboutIcon/>
          </ListItemIcon>
          <ListItemText primary='About' secondary='Info about application'/>
        </ListItem>
      </List>
    </Popover>
  </div>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
  onAddressBook: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onCreateWallet: () => void;
}

// Component properties
interface OwnProps {
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onAddressBook: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.ADDRESS_BOOK));
      },
      onSettings: () => {
        dispatch(screen.actions.gotoScreen('settings'));
      },
      onAbout: () => {
        dispatch(screen.actions.showDialog(EmeraldDialogs.ABOUT));
      },
      onCreateWallet: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_WALLET));
      },
    }
  }
)((Component));