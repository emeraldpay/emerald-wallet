import React from 'react';
import { AccountList, TxHistory } from '@emeraldwallet/react-app';
import Header from './header';

const Dashboard = () => {
  return (
    <React.Fragment>
      <Header/>
      <AccountList/>
      <TxHistory/>
    </React.Fragment>
  );
};

export default Dashboard;
