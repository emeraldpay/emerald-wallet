import React from 'react';
import { connect } from 'react-redux'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import Avatar from 'material-ui/Avatar'
import { cardSpace } from '../../lib/styles'
import log from 'loglevel'
import Immutable from 'immutable'

const Render = ({block}) => {

    const networkDetails = "Block #" + block;
    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-signal fa-2x" />} />;

    return (
        <Card style={cardSpace}>
            <CardHeader
                title="Network Status"
                avatar={titleAvatar}
                subtitle={networkDetails}
                actAsExpander={true}
                showExpandableButton={true}
            />
            <CardText expandable={false}>
            </CardText>
        </Card>
    )
};

const Status = connect(
    (state, ownProps) => {
        return {
            block: state.network.getIn(["currentBlock", "height"], -1)
        }
    },
    (dispatch, ownProps) => {
        return {}
    }
)(Render);

export default Status