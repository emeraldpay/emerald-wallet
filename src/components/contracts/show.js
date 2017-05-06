import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Card, CardTitle, CardHeader, CardText } from 'material-ui/Card';
import { FlatButton, FontIcon } from 'material-ui';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData} from '../../elements/dl';
import log from 'loglevel';
import { cardSpace } from '../../lib/styles';
import { gotoScreen } from '../../store/screenActions';

import InteractContract from './interactForm'

const Render = ({contract, functions, inputs, callContract}) => {
    const style = {
        fontFamily: 'monospace',
        letterSpacing: '.02em',
        margin: '5px',
        padding: '5px',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        outline: '1px solid rgb(224, 224, 224)',
        overflow: 'auto',
        maxHeight: '250px'
      };

    return (
        <Card style={cardSpace}>
            <CardHeader
                title={'Contract: ' + contract.get('name')}
                subtitle={contract.get('address')}
            />
            <CardText>
                <DescriptionList>
                    <DescriptionTitle>Version: </DescriptionTitle>
                    <DescriptionData>{contract.get('version')}</DescriptionData>

                    <DescriptionTitle>Options: </DescriptionTitle>
                    <DescriptionData>{contract.get('options')}</DescriptionData>

                    <DescriptionTitle>Creation Transaction: </DescriptionTitle>
                    <DescriptionData>{contract.get('txhash')}</DescriptionData>
                </DescriptionList>
                <Row>
                    <b>ABI / JSON Interface</b>
                    <div style={style}>
                     {JSON.stringify(contract.get('abi'))} 
                    </div>
                </Row>           
            </CardText>
            <CardTitle actAsExpander={true}>
                <FlatButton label="Access Contract"
                            icon={<FontIcon className="fa fa-arrow-circle-o-right" />}
                />
            </CardTitle>
            <CardText expandable={true}>
                <InteractContract contract={contract} />
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