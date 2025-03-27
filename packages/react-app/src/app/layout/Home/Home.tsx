import { IState, application } from '@emeraldwallet/store';
import { CircularProgress } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';
import WalletList from '../../../wallets/WalletList';

const useStyles = makeStyles()((theme) => ({
  loader: {
    marginRight: theme.spacing(),
  },
  statusMessage: {
    alignItems: 'center',
    color: '#999',
    display: 'flex',
    justifyContent: 'center',
  },
}));

interface HomeProps {
  connecting: boolean;
  statusMessage: string;
}

export const Home: React.FC<HomeProps> = ({ connecting, statusMessage }) => {
  const { classes } = useStyles();

  return connecting ? (
    <div className={classes.statusMessage}>
      <CircularProgress className={classes.loader} size={24} />
      {statusMessage}
    </div>
  ) : (
    <WalletList />
  );
};

export default connect((state: IState) => ({
  connecting: application.selectors.isConnecting(state),
  statusMessage: application.selectors.getMessage(state).message,
}))(Home);
