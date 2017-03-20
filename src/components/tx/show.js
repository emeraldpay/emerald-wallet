import React from 'react';
import { connect } from 'react-redux'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import { Row, Col } from 'react-flexbox-grid/lib/index'
import { DescriptionList, DescriptionTitle, DescriptionData} from '../../elements/dl'
import log from 'loglevel'
import Immutable from 'immutable'
import { cardSpace } from '../../lib/styles'
import { gotoScreen } from '../../store/screenActions'

const Render = ({transaction, account, goBack}) => {

    /** TODO: This will be a transaction display, and transaction will be an ImmutableMap **/

    return (
        <Card style={cardSpace}>
            <CardHeader
                title={'Transaction: ' + transaction}
                subtitle={transaction}
            />
            <CardText>
                <Row>
                    <Col xs={8}>
                        <DescriptionList>
                            <DescriptionTitle>Hash:</DescriptionTitle>
                            <DescriptionData>{transaction}</DescriptionData>

                            <DescriptionTitle>Block Number:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>Time:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>From:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>To:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>Value:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>Gas Provided:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>Gas Price:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>nonce:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                            <DescriptionTitle>Input Data:</DescriptionTitle>
                            <DescriptionData></DescriptionData>

                        </DescriptionList>
                    </Col>
                </Row>
            </CardText>
            <CardActions>
                <FlatButton label="Go Back"
                            onClick={goBack}
                            icon={<FontIcon className="fa fa-home" />}/>
            </CardActions>            
        </Card>
    )
};

const TransactionShow = connect(
    (state, ownProps) => {
        return {
        }
    },
    (dispatch, ownProps) => {
        return {
            cancel: () => {
                dispatch(gotoScreen('home'))
            },
            goBack: (account) => {
               dispatch(gotoScreen('account', ownProps.account)) 
            }
        }
    }
)(Render);

export default TransactionShow