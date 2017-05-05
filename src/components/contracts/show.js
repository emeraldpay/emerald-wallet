import React from 'react';
import { connect } from 'react-redux'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import { Row, Col } from 'react-flexbox-grid/lib/index'
import { DescriptionList, DescriptionTitle, DescriptionData} from '../../elements/dl'
import QRCode from 'qrcode.react'
import log from 'loglevel'
import Immutable from 'immutable'
import { cardSpace } from '../../lib/styles'
import { gotoScreen } from '../../store/screenActions'

const Render = ({contract, callContract}) => {

    return (
        <Card style={cardSpace}>
            <CardHeader
                title={'Contract: ' + contract.get('name')}
                subtitle={contract.get('address')}
                actAsExpander={true}
                showExpandableButton={true}
            />
            <CardActions>
                <FlatButton label="Interact"
                            onClick={callContract}
                            icon={<FontIcon className="fa fa-arrow-circle-o-right" />}/>
            </CardActions>
            <CardText expandable={true}>
                <Row>
                    <Col xs={8}>
                        <DescriptionList>
                            <DescriptionTitle>Address:</DescriptionTitle>
                            <DescriptionData>{contract.get('address')}</DescriptionData>

                        </DescriptionList>
                    </Col>
                </Row>
            </CardText>
        </Card>
    )
};

const ContractShow = connect(
    (state, ownProps) => {
        return {
        }
    },
    (dispatch, ownProps) => {
        return {
            callContract: () => {
                
            }
        }
    }
)(Render);

export default ContractShow