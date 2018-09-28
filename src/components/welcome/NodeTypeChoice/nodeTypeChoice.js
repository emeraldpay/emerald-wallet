import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import cx from 'classnames';
import { Button, Card } from 'emerald-js-ui';

import { useRpc } from '../../../store/launcher/launcherActions';
import { GastrackerMainnet, MainnetLocal } from '../../../lib/rpc/gethProviders';
import FullNodeLogo from './fullNodeLogo';
import RemoteNodeLogo from './remoteNodeLogo';

const styles = {
  container: {
    paddingTop: '40px',
    paddingBottom: '50px',
  },

  optionsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '49px',
  },

  nodeRectangle: {
    display: 'flex',
    border: '1px solid #DDDDDD',
    boxSizing: 'border-box',
    marginLeft: '14.5px',
    marginRight: '14.5px',
    paddingTop: '49px',
    paddingLeft: '35px',
    paddingRight: '35px',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '300px',
    maxHeight: '360px',
  },

  rectangleItem: {
    marginBottom: '30px',
  },

  title: {
    color: '#191919',
    display: 'flex',
    fontSize: '22px',
    lineHeight: '24px',
    justifyContent: 'center',
  },

  description: {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center',
  },
};

const NodeTypeChoice = ({ useFullNode, useRemoteNode }) => {
  return (
    <Card>
      <div style={ styles.container }>
        <div style={ styles.title }>Select how you're going to connect to the network</div>
        <div style={ styles.optionsContainer }>
          <div style={ styles.nodeRectangle }>
            <div style={ styles.rectangleItem }><FullNodeLogo /></div>
            <div style={ cx(styles.rectangleItem, styles.description) }>
                            More secure. But it takes a few hours to sync.
            </div>
            <div style={ styles.rectangleItem }>
              <Button
                primary
                label="Full Node"
                onClick={ useFullNode }
              />
            </div>
          </div>
          <div style={ styles.nodeRectangle }>
            <div style={ styles.rectangleItem }><RemoteNodeLogo/></div>
            <div style={ cx(styles.rectangleItem, styles.description) }>
                            Less secure. No need for long sync.
            </div>
            <div style={ styles.rectangleItem }>
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
