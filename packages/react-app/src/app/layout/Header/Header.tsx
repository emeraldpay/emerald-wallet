import { Settings as SettingsIcon } from '@emeraldplatform/ui-icons';
import { blockchains, screen } from '@emeraldwallet/store';
import { Button, Status } from '@emeraldwallet/ui';
import { AppBar, Toolbar } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

import EmeraldTitle from './Title';
import Total from './Total';

const styles = (theme: any) => ({
  appBarRight: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'inherit'
  },
  buttons: {
    label: {
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: '16px'
    }
  },
  appBarRoot: {
    backgroundColor: theme.palette.primary.contrastText
  }
});

export interface IHeaderProps {
  openSettings: any;
  classes: any;
  chains: any;
}

const blockDisplayStyles = createStyles({
  label: {
    fontWeight: 'normal',
    fontSize: '16px',
    textTransform: 'none'
  }
});

const SettingsButton = ({ classes, onClick }: {classes: any, onClick: any}) => (
  <Button
    variant='text'
    onClick={onClick}
    label='Settings'
    classes={{
      label: classes.text
    }}
    icon={<SettingsIcon/>}
  />
  );

const StyledSettingsButton = withStyles(blockDisplayStyles)(SettingsButton);

const Header = (props: IHeaderProps) => {
  const {
    openSettings
  } = props;

  return (
    <div>
      <div className={props.classes.appBarRoot}>
        <AppBar position='static' color='inherit'>
          <Toolbar>
            <EmeraldTitle />
            <div className={props.classes.appBarRight}>
              <Total />
              <Status blockchains={props.chains} />
              <StyledSettingsButton onClick={openSettings}/>
            </div>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
};

const StyledHeader = withStyles(styles)(Header);

const mapStateToProps = (state: any) => {
  return {
    chains: blockchains.selectors.getCurrentInfo(state),
    showFiat: true
  };
};

const mapDispatchToProps = (dispatch: any) => ({
  openSettings: () => {
    dispatch(screen.actions.gotoScreen('settings'));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledHeader);
