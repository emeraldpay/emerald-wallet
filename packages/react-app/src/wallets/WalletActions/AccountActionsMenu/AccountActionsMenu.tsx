import {
  Export as ExportIcon,
  MoreHorizontal as MoreHorizontalIcon,
  Print as PrintIcon,
  ViewHidden as ViewHiddenIcon,
  ViewVisible as ViewVisibleIcon
} from '@emeraldplatform/ui-icons';
import {
  ClickAwayListener, Grow, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Popper
} from '@material-ui/core';
import * as React from 'react';

export interface IProps {
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

  public handleClose = (event: React.MouseEvent<EventTarget>) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ open: false });
  }

  public handleExport = () => {
    this.props.onExport();
  }

  public handlePrint = () => {
    this.props.onPrint();
  }

  public handleHide = () => {
    this.props.onHide();
  }

  public handleUnhide = () => {
    this.props.onUnhide();
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
          ref={this.setAnchorEl}
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup='true'
          onClick={this.handleToggle}
        >
          <MoreHorizontalIcon/>
        </IconButton>
        <Popper open={open} anchorEl={this.anchorEl} keepMounted={true} transition={true}>
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom' }}
            >
              <Paper>
                <ClickAwayListener onClickAway={this.handleClose}>
                  <MenuList>
                    {showExport && (
                      <MenuItem onClick={this.handleExport}>
                        <ListItemIcon>
                          <ExportIcon/>
                        </ListItemIcon>
                        <ListItemText primary='EXPORT'/>
                      </MenuItem>
                    )}
                    {showPrint && (
                      <MenuItem onClick={this.handlePrint}>
                        <ListItemIcon>
                          <PrintIcon/>
                        </ListItemIcon>
                        <ListItemText primary='PRINT'/>
                      </MenuItem>
                    )}

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

  private setAnchorEl = (node: any) => {
    this.anchorEl = node;
  }
}

export default AccountActionsMenu;
