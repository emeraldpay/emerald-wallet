import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from '@emeraldplatform/ui-icons';
import { createStyles, Grid, IconButton, withStyles } from '@material-ui/core';
import * as React from 'react';

interface IProps {
  pageSize?: number;
  offset?: any;
  setOffset?: any;
  classes?: any;
}

const styles = createStyles({
  offset: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 900,
    marginTop: '8px'
  }
});

const Pager = ({ classes, offset, setOffset, ...other }: IProps) => {
  const pageSize = other.pageSize || 5;
  return (
    <Grid container={true} alignItems='center'>
      <Grid item={true} xs={5} style={{ textAlign: 'right' }}>
        <IconButton disabled={offset - pageSize < 0} onClick={() => setOffset(offset - pageSize)}>
          <ArrowLeftIcon />
        </IconButton>
      </Grid>
      <Grid item={true} xs={2} className={classes.offset}>
        {offset}
      </Grid>
      <Grid item={true} xs={5}>
        <IconButton onClick={() => setOffset(offset + pageSize)}>
          <ArrowRightIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles)(Pager);
