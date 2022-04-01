import { application, IState } from '@emeraldwallet/store';
import { CircularProgress, Grid } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import Dashboard from '../Dashboard';

const styles = {
  statusMessage: {
    color: '#999',
    marginTop: '15px',
  },
};

interface HomeProps {
  connecting: boolean;
  statusMessage: string;
}

export const Home: React.FC<HomeProps> = ({ connecting, statusMessage }) => {
  if (connecting) {
    return (
      <Grid container={true} alignItems="center" justify="center">
        <Grid item={true}>
          <CircularProgress size={50} />
        </Grid>
        <Grid>
          <div style={styles.statusMessage}>{statusMessage}</div>
        </Grid>
      </Grid>
    );
  }

  return <Dashboard />;
};

export default connect((state: IState) => ({
  connecting: application.selectors.isConnecting(state),
  statusMessage: application.selectors.getMessage(state).text,
}))(Home);
