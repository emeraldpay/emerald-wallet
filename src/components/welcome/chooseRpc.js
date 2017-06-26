import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';
import { useRpc } from 'store/launcherActions';

const Render = ({ useFullNode, useRemoteNode }) => {

    return (
        <Row>
            <Col xs={12}>
                <h2>Select how you're going to connect to the network</h2>
            </Col>
            <Col xs={12}>
                <List>
                    <ListItem
                        primaryText="Full Node"
                        secondaryText="Run Geth Node on your machine, takes time to synchronize but provides more control"
                        leftIcon={<FontIcon className="fa fa-database"/>}
                        onClick={useFullNode}
                    />
                    <ListItem
                        primaryText="Remote Node"
                        secondaryText="Use Public RPC nodes, works instantly (nodes provided by Gastracker.io and Epool.io)"
                        leftIcon={<FontIcon className="fa fa-cloud"/>}
                        onClick={useRemoteNode}
                    />
                </List>
            </Col>
        </Row>
    )
};


Render.propTypes = {
    useFullNode: PropTypes.func.isRequired,
    useRemoteNode: PropTypes.func.isRequired
};

const ChooseRPC = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        useFullNode: () => {
            dispatch(useRpc('local'))
        },
        useRemoteNode: () => {
            dispatch(useRpc('remote-auto'))
        }
    })
)(Render);

export default ChooseRPC;