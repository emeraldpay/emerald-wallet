import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';

import { useRpc } from '../../../store/launcherActions';
import { MainnetEpool, MainnetLocal } from '../../../lib/rpc/gethProviders';
import Card from '../../../elements/Card';
import FullNodeLogo from './fullNodeLogo';
import RemoteNodeLogo from './remoteNodeLogo';
import Button from '../../../elements/Button';

import classes from './nodeTypeChoice.scss';

const NodeTypeChoice = ({ useFullNode, useRemoteNode }) => {
    return (
        <Card>
            <div className={ classes.container }>
                <div className={ classes.title }>Select how you're going to connect to the network</div>
                <div className={ classes.optionsContainer }>
                    <div className={ classes.nodeRectangle }>
                        <div className={ classes.rectangleItem }><FullNodeLogo /></div>
                        <div className={ cx(classes.rectangleItem, classes.description) }>
                            More secure. But it takes a few hours to sync.
                        </div>
                        <div className={ classes.rectangleItem }>
                            <Button
                                primary
                                label="Full Node"
                                onClick={ useFullNode }
                            />
                        </div>
                    </div>
                    <div className={ classes.nodeRectangle }>
                        <div className={ classes.rectangleItem }><RemoteNodeLogo/></div>
                        <div className={ cx(classes.rectangleItem, classes.description) }>
                            Less secure. No need for long sync.
                        </div>
                        <div className={ classes.rectangleItem }>
                            <Button
                                label="Remote Node"
                                onClick={ useRemoteNode }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};


NodeTypeChoice.propTypes = {
    useFullNode: PropTypes.func.isRequired,
    useRemoteNode: PropTypes.func.isRequired,
};

export default connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        useFullNode: () => {
            dispatch(useRpc(MainnetLocal));
        },
        useRemoteNode: () => {
            dispatch(useRpc(MainnetEpool));
        },
    })
)(NodeTypeChoice);
