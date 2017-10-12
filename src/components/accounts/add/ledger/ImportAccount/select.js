import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';

import HDPath from './hdpath';
import AddrList from './addrlist';
import Pager from './pager';
import WaitConnection from '../waitConnection';
import Buttons from './buttons';

const Render = ({ connected }) => {
    if (!connected) {
        return (
            <Card>
                <CardText>
                    <WaitConnection/>
                </CardText>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <Row>
                    <Col xs={4}>
                        <HDPath/>
                    </Col>
                    <Col xs={4}>
                        <Pager/>
                    </Col>
                </Row>
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

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
        connected: state.ledger.get('connected'),
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Component;
