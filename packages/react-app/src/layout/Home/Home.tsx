import {addresses, application, IState} from '@emeraldwallet/store';
import { CircularProgress, Grid } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import Dashboard from '../Dashboard';
import Landing from '../Landing';

const styles = {
  statusMessage: {
    color: '#999',
    marginTop: '15px'
  }
};

export interface IHomeProps {
  connecting: boolean;
  statusMessage: string;
  accountsNum: number;
}

export const Home = (props: IHomeProps) => {
  const { connecting, statusMessage, accountsNum } = props;
  if (connecting) {
    return (
      <Grid container={true} alignItems='center' justify='center'>
        <Grid item={true}>
          <CircularProgress size={50}/>
        </Grid>
        <Grid>
          <div style={styles.statusMessage}>{statusMessage}</div>
        </Grid>
      </Grid>
    );
  }
  if (accountsNum === 0) {
    return (<Landing />);
  }
  return (<Dashboard />);
};

export default connect(
  (state: IState, ownProps) => ({
    accountsNum: addresses.selectors.all(state).size,
    connecting: application.selectors.isConnecting(state),
    statusMessage: application.selectors.getMessage(state).text
  }),
  (dispatch, ownProps) => ({})
)(Home);
