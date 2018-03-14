import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Button, Card } from 'emerald-js-ui';

import { useRpc } from '../../../store/launcher/launcherActions';
import { GastrackerMainnet, MainnetLocal } from '../../../lib/rpc/gethProviders';
import FullNodeLogo from './fullNodeLogo';
import RemoteNodeLogo from './remoteNodeLogo';

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
      dispatch(useRpc(GastrackerMainnet));
    },
  })
)(NodeTypeChoice);
