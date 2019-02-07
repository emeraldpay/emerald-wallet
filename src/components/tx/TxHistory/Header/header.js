// @flow
import React from 'react';
import withStyles from 'react-jss';
import { Search as SearchIcon } from '@emeraldplatform/ui-icons';
import muiThemeable from 'material-ui/styles/muiThemeable';
import TextField from '../../../../elements/Form/TextField';
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
  onTxFilterChange, onSearchChange, muiTheme, classes, txFilterValue,
}) => {
  return (
    <div className={ classes.headerContainer }>
      <div className={ classes.headerMain }>
        <div className={ classes.headerTitle }>History</div>
        <div className={ classes.filter }>
          <Filter onChange={onTxFilterChange} value={txFilterValue}/>
        </div>
      </div>
      <div className={ classes.search }>
        <TextField
          rightIcon={ <SearchIcon style={ styles.searchIcon } /> }
          onChange={onSearchChange}
          style={{ maxHeight: '40px' }}
          hintText="Search for amount or hash"
          hintStyle={{color: muiTheme.palette.primary3Color, fontWeight: '200', fontSize: '15px'}}
          underlineShow={ false }
        />
      </div>
    </div>
  );
};

export default muiThemeable()(withStyles(styles2)(Header));
