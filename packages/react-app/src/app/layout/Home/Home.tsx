import { IState, application } from '@emeraldwallet/store';
import { CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import Dashboard from '../Dashboard';

const useStyles = makeStyles((theme) =>
  createStyles({
    loader: {
      marginRight: theme.spacing(),
    },
    statusMessage: {
      alignItems: 'center',
      color: '#999',
      display: 'flex',
      justifyContent: 'center',
    },
  }),
);

interface HomeProps {
  connecting: boolean;
  statusMessage: string;
}

export const Home: React.FC<HomeProps> = ({ connecting, statusMessage }) => {
  const styles = useStyles();

  return connecting ? (
    <div className={styles.statusMessage}>
      <CircularProgress className={styles.loader} size={24} />
      {statusMessage}
    </div>
  ) : (
    <Dashboard />
  );
};

export default connect((state: IState) => ({
  connecting: application.selectors.isConnecting(state),
  statusMessage: application.selectors.getMessage(state).message,
}))(Home);
