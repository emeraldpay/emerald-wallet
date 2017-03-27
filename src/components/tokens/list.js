import React from 'react';
import { connect } from 'react-redux'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import { GridList, GridTile } from 'material-ui/GridList'
import FontIcon from 'material-ui/FontIcon'
import Avatar from 'material-ui/Avatar';
import { cardSpace } from '../../lib/styles'
import log from 'loglevel'
import Immutable from 'immutable'
import { gotoScreen } from '../../store/screenActions'
import Token from './token'

const Render = ({tokens, addToken}) => {

    const styles = {
      root: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
      },
      gridList: {
        width: 600,
        overflowY: 'auto',
      },
      titleStyle: {
        fontSize: "20px",
      }
    };

    const tokenGrid = <GridList style={styles.gridList} >
            {tokens.map( (token) => <Token key={token.get('address')} token={token}/>)}
                    </GridList>;

    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-dot-circle-o fa-2x" />} />;

    return (
        <div id="token-list">
            <Card style={cardSpace}>
                <CardHeader
                    title="Token List"
                    titleStyle={styles.titleStyle}
                    avatar={titleAvatar}
                    actAsExpander={false}
                    showExpandableButton={false}
                />
                <CardText style={styles.root} expandable={false}>
                    {tokenGrid}
                </CardText>
                <CardActions>
                    <FlatButton label="Add Token"
                                onClick={addToken}
                                icon={<FontIcon className="fa fa-plus-circle" />}/>
                </CardActions>
            </Card>
        </div>
    )
};

const TokensList = connect(
    (state, ownProps) => {
        return {
            tokens: state.tokens.get('tokens', Immutable.List()),
        }
    },
    (dispatch, ownProps) => {
        return {
            addToken: () => {
                console.log("TODO: Add token")
                //dispatch(gotoScreen('add-token'))
            }
        }
    }
)(Render);

export default TokensList