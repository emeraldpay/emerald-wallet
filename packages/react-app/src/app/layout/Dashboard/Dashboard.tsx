import * as React from 'react';
import WalletList from '../../../wallets/WalletList';
// import TxHistory from '../../transactions/TxHistory';
import Header from './DashboardHeader';

const Dashboard = () => {
  return (
    <React.Fragment>
      <Header/>
      <WalletList/>
      {/*<TxHistory/>*/}
    </React.Fragment>
  );
};

export default Dashboard;
