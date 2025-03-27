import {ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon} from '../../../icons';
import {Grid, IconButton} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

interface IProps {
  pageSize?: number;
  offset?: any;
  setOffset?: any;
}

const useStyles = makeStyles()({
  offset: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 900,
    marginTop: '8px'
  }
});

const Pager = ({ offset, setOffset, ...other }: IProps) => {
  const { classes } = useStyles();
  const pageSize = other.pageSize || 5;

  function handleRightClick () {
    if (setOffset) {
      setOffset(offset + pageSize);
    }
  }

  function handleLeftClick () {
    if (setOffset) {
      setOffset(offset - pageSize);
    }
  }

  return (
    <Grid container={true} alignItems='center'>
      <Grid item={true} xs={5} style={{ textAlign: 'right' }}>
        <IconButton disabled={offset - pageSize < 0} onClick={handleLeftClick}>
          <ArrowLeftIcon />
        </IconButton>
      </Grid>
      <Grid item={true} xs={2} className={classes.offset}>
        {offset}
      </Grid>
      <Grid item={true} xs={5}>
        <IconButton onClick={handleRightClick}>
          <ArrowRightIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default Pager;
