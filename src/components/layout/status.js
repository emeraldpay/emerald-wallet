import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import LinearProgress from 'material-ui/LinearProgress';

const Render = ({ block, chain, progress, peerCount, showDetails, connecting }) => {
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

    let details = null;
    if (connecting) {
        details =  <Row>
            <Col xs={12} style={styles.paddingSmVert}>
                <i className="fa fa-spin fa-spinner"/> Connecting...
            </Col>
        </Row>
    } else if (showDetails) {
        details =  <Row>
            <Col xs={12} style={styles.paddingSmVert}>
                {peerCount} {peerCount === 1 ? 'peer' : 'peers'}, {block} blocks
                <LinearProgress mode="determinate" color="green" value={progress} />
            </Col>
        </Row>
    } else {
        details =  <Row>
            <Col xs={12} style={styles.paddingSmVert}>
                {block} blocks
            </Col>
        </Row>
    }

    return (
        <div style={styles.block}>
            <Row>
                <Col xs={10} xsOffset={1}>
                    <span style={styles.name}>
                    {chain}
                    </span>
                </Col>
            </Row>
            {details}
        </div>
    );
};

Render.propTypes = {
    block: PropTypes.number.isRequired,
    progress: PropTypes.number,
    chain: PropTypes.string.isRequired,
    peerCount: PropTypes.number,
    showDetails: PropTypes.bool.isRequired,
    connecting: PropTypes.bool.isRequired
};

const Status = connect(
    (state, ownProps) => {
        const curBlock = state.network.getIn(['currentBlock', 'height'], -1);
        const showDetails = state.launcher.getIn(["chain", "rpc"]) === 'local';
        let props = {
            block: curBlock,
            showDetails,
            chain: (state.network.get('chain') || {}).get('title') || '',
            connecting: state.launcher.get('connecting')
        };
        if (showDetails) {
            const tip = state.network.getIn(['sync', 'highestBlock'], -1);
            const peerCount = state.network.get('peerCount');
            const progress = ((curBlock / tip) * 100);
            return {
                progress: isNaN(progress) ? 100 : progress,
                peerCount,
                ...props
            };
        }
        return props
    },
    (dispatch, ownProps) => ({})
)(Render);

export default Status;
