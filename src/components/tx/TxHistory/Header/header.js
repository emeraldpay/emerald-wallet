// @flow
import React from 'react';
import { Search as SearchIcon } from 'emerald-js-ui/lib/icons';
import TextField from '../../../../elements/Form/TextField';
import Filter from './filter';

import classes from './header.scss';

const styles = {
  searchIcon: {
    width: '14px',
    height: '14px',
  },
};

const Header = ({onTxFilterChange, onSearchChange}) => {
  return (
    <div className={ classes.headerContainer }>
      <div className={ classes.headerMain }>
        <div className={ classes.headerTitle }>History</div>
        <div className={ classes.filter }><Filter onChange={onTxFilterChange}/></div>
      </div>
      <div className={ classes.search }>
        <TextField
          rightIcon={ <SearchIcon style={ styles.searchIcon } /> }
          onChange={onSearchChange}
          style={{ maxHeight: '40px' }}
          hintText="Search for amount or hash"
          underlineShow={ false }
        />
      </div>
    </div>
  );
};

export default Header;
