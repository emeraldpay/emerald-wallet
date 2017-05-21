import React from 'react';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import LinearProgress from 'material-ui/LinearProgress';
import { cardSpace } from 'lib/styles';

const Render = ({ block, syncing, chain }) => {
    let networkDetails = `Block ${block}`;
    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-signal fa-2x" />} />;

    let progress = null;
    if (typeof syncing === 'object' && syncing.get('syncing')) {
        progress = <LinearProgress mode="determinate"
                                   min={syncing.get('startingBlock')}
                                   max={syncing.get('highestBlock')}
                                   value={syncing.get('currentBlock')} />;
        networkDetails = `Block ${syncing.get('currentBlock')} of ${syncing.get('highestBlock')}`;
    }

    return (
        <Card style={cardSpace}>
            <CardHeader
                title="Network Status"
                avatar={titleAvatar}
                subtitle={`${networkDetails} (${chain})`}
                actAsExpander={true}
                showExpandableButton={true}
            />
            <CardActions>
                {progress}
            </CardActions>
            <CardText expandable={false}>
            </CardText>
        </Card>
    );
};

const Status = connect(
    (state, ownProps) => ({
        block: state.network.getIn(['currentBlock', 'height'], -1),
        syncing: state.network.get('sync'),
        chain: (state.network.get('chain') || {}).get('name'),
    }),
    (dispatch, ownProps) => ({})
)(Render);

export default Status;
