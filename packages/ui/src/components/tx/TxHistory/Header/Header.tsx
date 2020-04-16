import { Search as SearchIcon } from '@emeraldplatform/ui-icons';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import { createStyles, withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import * as React from 'react';
import Filter from './Filter';

const styles2 = createStyles({
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#191919',
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: '24px',
    textTransform: 'uppercase'
  },
  filter: {
    marginLeft: '40px',
    maxWidth: '186px'
  },
  headerMain: {
    display: 'flex',
    alignItems: 'center'
  },
  search: {
    maxHeight: '40px'
  },
  searchTextField: {
    fontSize: '14px'
  }
});

interface IProps {
  onTxFilterChange?: any;
  onSearchChange?: any;
  classes?: any;
  txFilterValue?: any;
}

const Header = ({
  onTxFilterChange, onSearchChange, classes, txFilterValue
}: IProps) => {
  return (
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
          placeholder='Search for amount or hash'
          InputProps={{
            className: classes.searchTextField,
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton disabled={true}><SearchIcon /></IconButton>
              </InputAdornment>
            )
          }}
        />
      </div>
    </div>
  );
};

export default (withStyles(styles2)(Header));
