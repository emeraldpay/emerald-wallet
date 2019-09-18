import {
  Export as ExportIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Print as PrintIcon,
  ViewHidden as ViewHiddenIcon,
  ViewVisible as ViewVisibleIcon
} from '@emeraldplatform/ui-icons';
import { Popper } from '@material-ui/core';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import * as React from 'react';

export interface IProps {
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

interface IState {
  open: boolean;
}

export class AccountActionsMenu extends React.Component<IProps, IState> {
  public state = {
    open: false
  };
  public anchorEl: any;

  public handleToggle = () => {
    this.setState((state) => ({ open: !state.open }));
  }

  public handleClose = (event: {target: any}) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ open: false });
  }

  public handleExport = () => {
    this.props.onExport(this.props.chain)();
  }

  public handlePrint = () => {
    this.props.onPrint(this.props.chain)();
  }

  public handleHide = () => {
    this.props.onHide(this.props.chain)();
  }

  public handleUnhide = () => {
    this.props.onUnhide(this.props.chain)();
  }

  public renderHide = (disabled: boolean) => {
    return (
      <MenuItem disabled={disabled} onClick={this.handleHide}>
        <ListItemIcon>
          <ViewHiddenIcon />
        </ListItemIcon>
        <ListItemText primary='HIDE' />
      </MenuItem>
    );
  }

  public renderUnhide = () => {
    return (
      <MenuItem onClick={this.handleUnhide}>
        <ListItemIcon>
          <ViewVisibleIcon />
        </ListItemIcon>
        <ListItemText primary='UNHIDE' />
      </MenuItem>
    );
  }

  public render () {
    const {
      hiddenAccount, showPrint, showExport, canHide
    } = this.props;
    const { open } = this.state;

    return (
      <div>
        <IconButton
          buttonRef={(node) => {
            this.anchorEl = node;
          }}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup='true'
          onClick={this.handleToggle}
        >
          <MoreHorizontalIcon/>
        </IconButton>
        <Popper open={open} anchorEl={this.anchorEl} transition={true}>
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
  }
}

export default AccountActionsMenu;
