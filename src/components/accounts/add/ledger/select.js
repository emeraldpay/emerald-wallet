import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { Card, CardHeader, CardActions, CardText } from 'material-ui/Card';

import HDPath from './hdpath';
import AddrList from './addrlist';
import Pager from './pager';

const Render = ({  }) => {

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
        </Card>
    )

};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Component;
