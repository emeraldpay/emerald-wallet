import * as React from 'react';
import AccountList from '../../accounts/AccountList';
import TxHistory from '../../transactions/TxHistory';
import Header from './Header';

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
