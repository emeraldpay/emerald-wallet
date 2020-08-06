import * as React from 'react';
import WalletList from '../../../wallets/WalletList';
// import TxHistory from '../../transactions/TxHistory';

const Dashboard = () => {
  return (
    <React.Fragment>
      <WalletList/>
      {/*<TxHistory/>*/}
    </React.Fragment>
  );
};

export default Dashboard;
