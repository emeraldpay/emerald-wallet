import React from 'react';
import { connect } from 'react-redux';
import { ArrowLeft as ArrowLeftIcon, ArrowRight as ArrowRightIcon } from '@emeraldplatform/ui-icons';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import ledger from 'store/ledger';

const pageSize = 5;

const Pager = ({ offset, setOffset }) => {
  const offsetStyle = {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 900,
    marginTop: '8px',
  };
  return (
    <Grid container alignItems="center">
      <Grid item xs={5} style={{textAlign: 'right'}}>
        <IconButton disabled={offset - pageSize < 0} onClick={() => setOffset(offset - pageSize)}ssss>
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

export default connect(
  (state, ownProps) => ({
    offset: state.ledger.getIn(['hd', 'offset']),
  }),
  (dispatch, ownProps) => ({
    setOffset: (offset) => {
      dispatch(ledger.actions.getAddresses(offset, pageSize));
    },
  })
)(Pager);
