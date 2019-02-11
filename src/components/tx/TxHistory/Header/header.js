// @flow
import React from 'react';
import withStyles from 'react-jss';
import { Search as SearchIcon } from '@emeraldplatform/ui-icons';
import muiThemeable from 'material-ui/styles/muiThemeable';
import TextField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import { MuiThemeProvider } from '@material-ui/core/styles';
import theme from '@emeraldplatform/ui/lib/theme';
import Filter from './filter';

const styles = {
  searchIcon: {
    width: '14px',
    height: '14px',
  },
};

const styles2 = {
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
    textTransform: 'uppercase',
  },
  filter: {
    marginLeft: '40px',
    maxWidth: '186px',
  },
  headerMain: {
    display: 'flex',
    alignItems: 'center',
  },
  search: {
    maxHeight: '40px',
  },
};

const Header = ({
  onTxFilterChange, onSearchChange, classes, txFilterValue,
}) => {
  return (
    <MuiThemeProvider theme={theme} >
      <div className={classes.headerContainer}>
        <div className={classes.headerMain}>
          <div className={classes.headerTitle}>History</div>
          <div className={classes.filter}>
            <Filter onChange={onTxFilterChange} value={txFilterValue} />
          </div>
        </div>
        <div className={classes.search}>
          {/* TODO: use emeraldplatform/ui/Input */}
          <TextField
            onChange={onSearchChange}
            style={{ maxHeight: '40px' }}
            placeholder="Search for amount or hash"
            underlineShow={false}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </div>
      </div>
    </MuiThemeProvider>
  );
};

export default (withStyles(styles2)(Header));
