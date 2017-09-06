import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import Immutable from 'immutable';

import TransactionsHistory from '../../components/tx/TxHistory';
import AccountsList from '../../components/accounts/AccountList';

const Dashboard = (props) => {
    const { connecting } = props;

    if (connecting) {
        return (
            <div>
                <Grid>
                    <Row center="xs">
                        <Col xs={3}>
                            <i className="fa fa-spin fa-spinner"/> Loading...
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }

    return (
        <div>
            <AccountsList/>
            {/* #hidden#146 <TokensList/> */}
            <TransactionsHistory/>
        </div>
    );
};

Dashboard.propTypes = {
    connecting: PropTypes.bool.isRequired,
};

export default connect(
    (state, ownProps) => ({
        accounts: state.accounts.get('accounts', Immutable.List()),
        connecting: state.launcher.get('connecting'),
    }),
    (dispatch, ownProps) => ({
    })
)(Dashboard);
