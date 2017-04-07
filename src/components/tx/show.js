import React from 'react';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData} from '../../elements/dl';
import log from 'loglevel';
import Immutable from 'immutable';
import { cardSpace } from '../../lib/styles';
import { gotoScreen } from '../../store/screenActions';
import { toNumber } from 'lib/convert';

const Render = ({hash, transaction, account, goBack}) => {

    /** TODO: This will be a transaction display, and transaction will be an ImmutableMap **/

    return (
        <Card style={cardSpace}>
            <CardHeader title={'Transaction: ' + hash}/>
            <CardText>
                <Row>
                    <Col xs={12}>
                        <DescriptionList>
                            <DescriptionTitle>Hash:</DescriptionTitle>
                            <DescriptionData>{transaction.get('hash')}</DescriptionData>

                            <DescriptionTitle>Block Number:</DescriptionTitle>
                            <DescriptionData>{toNumber(transaction.get('blockNumber'))}</DescriptionData>
                            <DescriptionTitle>Block hash:</DescriptionTitle>
                            <DescriptionData>{transaction.get('blockHash') || '?'}</DescriptionData>

                            <DescriptionTitle>From:</DescriptionTitle>
                            <DescriptionData>{transaction.get('from')}</DescriptionData>

                            <DescriptionTitle>To:</DescriptionTitle>
                            <DescriptionData>{transaction.get('to')}</DescriptionData>

                            <DescriptionTitle>Value:</DescriptionTitle>
                            <DescriptionData>
                                {transaction.get('value') ? transaction.get('value').getEther() + ' Ether' : '--'}
                            </DescriptionData>

                            <DescriptionTitle>Gas Provided:</DescriptionTitle>
                            <DescriptionData>{toNumber(transaction.get('gas'))}</DescriptionData>

                            <DescriptionTitle>Gas Price:</DescriptionTitle>
                            <DescriptionData>
                                {transaction.get('gasPrice') ? transaction.get('gasPrice').getMwei() + ' MWei' : '--'}
                            </DescriptionData>

                            <DescriptionTitle>nonce:</DescriptionTitle>
                            <DescriptionData>{toNumber(transaction.get('nonce'))}</DescriptionData>

                            <DescriptionTitle>Input Data:</DescriptionTitle>
                            <DescriptionData>{transaction.get('input') === '0x' ? '--' : transaction.get('input')}</DescriptionData>

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
            transaction: state.accounts.get('trackedTransactions').find(
                (tx) => tx.get('hash') === ownProps.hash
            )
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