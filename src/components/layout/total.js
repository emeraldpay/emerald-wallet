import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import Immutable from 'immutable';
import { Wei } from 'lib/types';

const Render = ({ total }) => {
    const styleTitle = {
    };
    const styleTotal = {
        fontSize: '40px',
    };

    return (
        <div>
            <Row>
                <Col xs={12} style={styleTitle}>Total</Col>
            </Row>
            <Row>
                <Col xs={12} style={styleTotal}>
                    {total} ETC
                </Col>
            </Row>
        </div>
    );
};

Render.propTypes = {
    total: PropTypes.number.isRequired,
};


const Total = connect(
    (state, ownProps) => ({
        total: state.accounts.get('accounts', Immutable.List()).map((account) => {
            if (account.get('balance')) {
                return account.get('balance');
            }
            return new Wei(0);
        }).reduce((t, v) => t.plus(v), new Wei(0)).getEther(),
    }),
    (dispatch, ownProps) => ({})
)(Render);

export default Total;
