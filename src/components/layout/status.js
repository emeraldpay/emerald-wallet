import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';

const Render = ({ block, chain, progress }) => {
    // networkDetails = `Block ${syncing.get('currentBlock')} of ${syncing.get('highestBlock')}`;

    const styles = {
        block: {
            backgroundColor: '#eee',
            marginTop: '-20px',
            color: '#bbb',
            fontSize: '0.8rem',
        },
        name: {
            backgroundColor: '#3a3',
            padding: '0 0.4rem',
            color: 'white',
            fontSize: '0.9rem',
            lineHeight: '1.1rem',
        },
        paddingSmVert: {
            paddingTop: '0.3rem',
            paddingBottom: '0.3rem',
        },
        progress: {
            total: {
                height: '0.2rem',
            },
            current: {
                backgroundColor: 'green',
                minWidth: `${progress}%`,
                height: '100%',
            },
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
                <Col xs={12} style={styles.paddingSmVert}>
                    10 peers, {block} blocks
                </Col>
            </Row>
            <Row >
                <Col style={styles.progress.total}>
                    <div style={styles.progress.current}></div>
                </Col>
            </Row>
        </div>
    );
};

Render.propTypes = {
    block: PropTypes.number.isRequired,
    progress: PropTypes.number.isRequired,
    // syncing: PropTypes.object.isRequired,
    chain: PropTypes.string.isRequired,
};

const Status = connect(
    (state, ownProps) => {
        const curBlock = state.network.getIn(['currentBlock', 'height'], -1);
        const tip = state.network.getIn(['sync', 'highestBlock'], -1);
        return {
            block: curBlock,
            progress: ((curBlock / tip) * 100),
            chain: (state.network.get('chain') || {}).get('name'),
        };
        // syncing: state.network.get('sync');
    },
    (dispatch, ownProps) => ({})
)(Render);

export default Status;
