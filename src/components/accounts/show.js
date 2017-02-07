import React from 'react';
import { connect } from 'react-redux'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import log from 'loglevel'
import Immutable from 'immutable'

const Render = ({account}) => {

    const value = (account.get('balance') ? account.get('balance').getEther() : '?') + ' Ether';

    return (
        <Card>
            <CardHeader
                title={'Address: ' + account.get('id')}
                subtitle={value}
                actAsExpander={false}
                showExpandableButton={false}
            />
            <CardActions>
                <FlatButton label="Send"
                            icon={<FontIcon className="fa fa-arrow-circle-o-up" />}/>
                <FlatButton label="Receive"
                            icon={<FontIcon className="fa fa-arrow-circle-o-down" />}/>
            </CardActions>
            <CardText expandable={false}>

            </CardText>
        </Card>
    )
};

const AccountShow = connect(
    (state, ownProps) => {
        return {
        }
    },
    (dispatch, ownProps) => {
        return {}
    }
)(Render);

export default AccountShow