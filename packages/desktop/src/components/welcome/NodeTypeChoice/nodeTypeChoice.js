import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import cx from 'classnames';
import { Button } from '@emeraldwallet/ui';
import {useRpc} from '../../../store/launcher/launcherActions';
import {RemoteMainnet, MainnetLocal} from '../../../lib/rpc/gethProviders';
import FullNodeLogo from './fullNodeLogo';
import RemoteNodeLogo from './remoteNodeLogo';

const styles = (theme) => ({
  container: {
    paddingTop: '40px',
    paddingBottom: '50px',
    borderRadius: '1px',
    backgroundColor: theme.palette.background.default,
  },
  optionsContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '49px',
  },
  nodeRectangle: {
    boxSizing: 'border-box',
    border: '1px solid #DDDDDD',
    marginLeft: '14.5px',
    marginRight: '14.5px',
    paddingTop: '49px',
    paddingLeft: '35px',
    paddingRight: '35px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '300px',
    maxHeight: '360px',
  },
  rectangleItem: {
    // margin-top: 40px;
    marginBottom: '30px',
  },
  title: {
    color: '#191919',
    fontSize: '22px',
    lineHeight: '24px',
    display: 'flex',
    justifyContent: 'center',
  },
  description: {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '20px',
    textAlign: 'center',
  },
});

const NodeTypeChoice = ({useFullNode, useRemoteNode, classes}) => {
  return (
    <div className={classes.container}>
      <div className={classes.title}>Select how you're going to connect to the network</div>
      <div className={classes.optionsContainer}>
        <div className={classes.nodeRectangle}>
          <div className={classes.rectangleItem}><FullNodeLogo/></div>
          <div className={cx(classes.rectangleItem, classes.description)}>
            More secure. But it takes a few hours to sync.
          </div>
          <div className={classes.rectangleItem}>
            <Button
              primary={false}
              label="Full Node"
              onClick={useFullNode}
            />
          </div>
        </div>
        <div className={classes.nodeRectangle}>
          <div className={classes.rectangleItem}><RemoteNodeLogo/></div>
          <div className={cx(classes.rectangleItem, classes.description)}>
            Less secure. No need for long sync.
          </div>
          <div className={classes.rectangleItem}>
            <Button
              label="Remote Node"
              onClick={useRemoteNode}
              primary={true}/>
          </div>
        </div>
      </div>
    </div>
  );
};


NodeTypeChoice.propTypes = {
  useFullNode: PropTypes.func.isRequired,
  useRemoteNode: PropTypes.func.isRequired,
};

const StyledNodeTypeChoice = withStyles(styles)(NodeTypeChoice);

export default connect(
  (state, ownProps) => ({}),
  (dispatch, ownProps) => ({
    useFullNode: () => {
      dispatch(useRpc(MainnetLocal));
    },
    useRemoteNode: () => {
      dispatch(useRpc(RemoteMainnet));
    },
  })
)(StyledNodeTypeChoice);
