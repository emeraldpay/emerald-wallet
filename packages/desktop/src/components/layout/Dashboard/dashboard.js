import React from 'react';
import { AccountList } from '@emeraldwallet/react-app';
import TransactionsHistory from '../../tx/TxHistory';
import Header from './header';

const Dashboard = () => {
  return (
    <React.Fragment>
      <Header/>
      <AccountList/>
      <TransactionsHistory/>
    </React.Fragment>
  );
};

export default Dashboard;
