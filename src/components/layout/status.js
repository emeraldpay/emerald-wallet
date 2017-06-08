import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';

const Render = ({ block, chain }) => {
    // networkDetails = `Block ${syncing.get('currentBlock')} of ${syncing.get('highestBlock')}`;

    const styles = {
        block: {
            backgroundColor: '#ccc',
        },
        name: {
            backgroundColor: '#3a3',
            padding: '0 5px 0 5px',
        },
    };

    return (
        <div style={styles.block}>
            <Row>
                <Col xs={10} xsOffset={1}>
                    <span style={styles.name}>
                    {chain}
                    </span>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    10 peers, {block} blocks
                </Col>
            </Row>
        </div>
    );
};

Render.propTypes = {
    block: PropTypes.number.isRequired,
    // syncing: PropTypes.object.isRequired,
    chain: PropTypes.string.isRequired,
};

const Status = connect(
    (state, ownProps) => ({
        block: state.network.getIn(['currentBlock', 'height'], -1),
        // syncing: state.network.get('sync'),
        chain: (state.network.get('chain') || {}).get('name'),
    }),
    (dispatch, ownProps) => ({})
)(Render);

export default Status;
