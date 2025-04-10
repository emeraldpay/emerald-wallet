import { AppBar, Toolbar } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import HeaderMenu from './HeaderMenu';
import EmeraldTitle from './Title';
import Total from './Total';

const useStyles = makeStyles()((theme) => ({
  appBarRight: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 'inherit',
  },
  appBarRoot: {
    backgroundColor: theme.palette.primary.contrastText,
  },
}));

const Header: React.FC = () => {
  const { classes } = useStyles();

  return (
    <div className={classes.appBarRoot}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <EmeraldTitle />
          <div className={classes.appBarRight}>
            <Total />
            <HeaderMenu />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
