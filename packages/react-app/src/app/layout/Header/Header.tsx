import { AppBar, Toolbar, makeStyles } from '@material-ui/core';
import { createStyles } from '@material-ui/core/styles';
import * as React from 'react';
import HeaderMenu from './HeaderMenu';
import EmeraldTitle from './Title';
import Total from './Total';

const useStyles = makeStyles((theme) =>
  createStyles({
    appBarRight: {
      display: 'flex',
      alignItems: 'center',
      marginTop: 'inherit',
    },
    appBarRoot: {
      backgroundColor: theme.palette.primary.contrastText,
    },
  }),
);

const Header: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.appBarRoot}>
      <AppBar position="static" color="inherit">
        <Toolbar>
          <EmeraldTitle />
          <div className={styles.appBarRight}>
            <Total />
            <HeaderMenu />
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
