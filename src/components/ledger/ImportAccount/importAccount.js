import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';

import HDPath from './hdpath';
import AddrList from './addrlist';
import Pager from './pager';
import WaitDialog from '../WaitDialog';
import Buttons from './buttons';

export const ImportAccount = ({ connected }) => {
    if (!connected) {
        return (<WaitDialog/>);
    }

    return (
        <Card>
            <CardHeader>
                <div>
                    <HDPath/>
                </div>
                <div>
                    <Pager/>
                </div>
            </CardHeader>
            <CardText>
                <AddrList/>
            </CardText>
            <CardActions>
                <Buttons/>
            </CardActions>
        </Card>
    );
};

ImportAccount.propTypes = {
};

export default connect(
    (state, ownProps) => ({
        connected: state.ledger.get('connected'),
    }),
    (dispatch, ownProps) => ({
    })
)(ImportAccount);
