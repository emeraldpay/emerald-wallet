import React from 'react';
import { connect } from 'react-redux';
import { Card, CardTitle, CardHeader, CardText } from 'material-ui/Card';
import { FlatButton, FontIcon } from 'material-ui';
import { Row } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import { cardSpace, code } from 'lib/styles';

import InteractContract from './interactForm';

const Render = ({ contract, functions, inputs, callContract }) => (
  <Card style={cardSpace}>
    <CardHeader
      title={`Contract: ${contract.get('name')}`}
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
        <div style={code}>
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
);


const ContractShow = connect(
  (state, ownProps) => ({

  }),
  (dispatch, ownProps) => ({
    callContract: () => {

    },
  })
)(Render);

export default ContractShow;
