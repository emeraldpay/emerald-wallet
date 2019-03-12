import * as React from 'react';
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import MenuItem from "@material-ui/core/MenuItem";
import IconButton from "@material-ui/core/IconButton";
import {
  Print as PrintIcon, Export as ExportIcon, ViewVisible as ViewVisibleIcon, ViewHidden as ViewHiddenIcon, MoreHorizontal as MoreHorizontalIcon
} from '@emeraldplatform/ui-icons';
import {Popper} from "@material-ui/core";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import MenuList from "@material-ui/core/MenuList";

interface Props {
  chain: string;
  hiddenAccount: boolean;
  canHide: boolean;
  showPrint: boolean;
  showExport: boolean;
  onPrint?: any;
  onHide?: any;
  onUnhide?: any;
  onExport?: any;
}

interface State {
  open: boolean;
}

export class AccountActionsMenu extends React.Component<Props, State> {
  state = {
    open: false,
  };
  anchorEl: any;

  handleToggle = () => {
    this.setState(state => ({ open: !state.open }));
  };

  handleClose = (event: {target: any}) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ open: false });
  };

  handleExport = () => {
    this.props.onExport(this.props.chain)();
  };

  handlePrint = () => {
    this.props.onPrint(this.props.chain)();
  };

  handleHide = () => {
    this.props.onHide(this.props.chain)();
  };

  handleUnhide = () => {
    this.props.onUnhide(this.props.chain)();
  };

  renderHide = (disabled: boolean) => {
    return (
      <MenuItem disabled={disabled} onClick={this.handleHide}>
        <ListItemIcon>
          <ViewHiddenIcon />
        </ListItemIcon>
        <ListItemText primary='HIDE' />
      </MenuItem>
    );
  };

  renderUnhide = () => {
    return (
      <MenuItem onClick={this.handleUnhide}>
        <ListItemIcon>
          <ViewVisibleIcon />
        </ListItemIcon>
        <ListItemText primary='UNHIDE' />
      </MenuItem>
    );
  };

  render() {
    const {
      hiddenAccount, showPrint, showExport, canHide,
    } = this.props;
    const { open } = this.state;

    return (
      <div>
        <IconButton
          buttonRef={node => {
            this.anchorEl = node;
          }}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={this.handleToggle}
        >
          <MoreHorizontalIcon/>
        </IconButton>
        <Popper open={open} anchorEl={this.anchorEl} transition>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList>
                    {showExport
                    && <MenuItem onClick={this.handleExport}>
                      <ListItemIcon>
                        <ExportIcon/>
                      </ListItemIcon>
                      <ListItemText primary='EXPORT'/>
                    </MenuItem>}
                    {showPrint
                    && <MenuItem onClick={this.handlePrint}>
                      <ListItemIcon>
                        <PrintIcon/>
                      </ListItemIcon>
                      <ListItemText primary='PRINT'/>
                    </MenuItem>}

                    {!hiddenAccount && this.renderHide(!canHide)}
                    {hiddenAccount && this.renderUnhide()}

                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  };
}

export default AccountActionsMenu;