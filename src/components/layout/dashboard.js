import React from 'react';
import TransactionsList from '../tx/list';
import AccountsList from '../accounts/list';

const Dashboard = () => {
    return (
    <div>
        <AccountsList/>
        {/* #hidden#146 <TokensList/> */}
        <TransactionsList/>
    </div>
    );
};

export default Dashboard;
