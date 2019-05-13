import * as React from 'react';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from '@emeraldplatform/ui-icons';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import {CSSProperties} from "@material-ui/styles";

const pageSize = 5;

interface Props {
  offset?: any;
  setOffset?: any;
}

const offsetStyle = {
  textAlign: 'center',
  fontSize: '16px',
  fontWeight: 900,
  marginTop: '8px',
} as CSSProperties;

const Pager = ({ offset, setOffset }: Props) => {

  return (
    <Grid container alignItems="center">
      <Grid item xs={5} style={{textAlign: 'right'}}>
        <IconButton disabled={offset - pageSize < 0} onClick={() => setOffset(offset - pageSize)}>
          <ArrowLeftIcon />
        </IconButton>
      </Grid>
      <Grid item xs={2} style={offsetStyle}>
        {offset}
      </Grid>
      <Grid item xs={5}>
        <IconButton onClick={() => setOffset(offset + pageSize)}>
          <ArrowRightIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default Pager;
