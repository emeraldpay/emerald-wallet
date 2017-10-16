import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const Render = ({ hdbase }) => {
    return (
        <span>HD Path: {hdbase}</span>
    );
};

Render.propTypes = {
};

const Component = connect(
    (state, ownProps) => ({
        hdbase: state.ledger.getIn(['hd', 'base']),
    }),
    (dispatch, ownProps) => ({
    })
)(Render);

export default Component;
