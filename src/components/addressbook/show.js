import React from 'react';
import { connect } from 'react-redux';
import {
  Card, CardActions, CardHeader, CardText
} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Create from 'material-ui/svg-icons/content/create';
import DeleteSweep from 'material-ui/svg-icons/content/delete-sweep';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import QRCode from 'qrcode.react';
import Immutable from 'immutable';
import { cardSpace } from 'lib/styles';
import Addressbook from '../../store/vault/addressbook';
import { gotoScreen } from '../../store/wallet/screen/screenActions';
import AddressEdit from './EditContact';


class CardEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  handleExpandChange = (expanded) => {
    this.setState({ expanded });
  }

  handleExpand = () => {
    this.setState({ expanded: true });
  }

  handleReduce = () => {
    this.setState({ expanded: false });
  }

  render() {
    return (
      <Card style={cardSpace} expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
        <CardActions>
          <FlatButton
            label="Edit"
            onClick={this.handleExpand}
            icon={<Create />}
          />
          <FlatButton
            label="Forget"
            onClick={this.props.onDelete}
            icon={<DeleteSweep />}
          />
        </CardActions>
        <CardText expandable={true}>
          <CardActions>
            <AddressEdit
              address={this.props.address}
              cancel={this.handleReduce}
              submit={this.props.onSubmit} />
          </CardActions>
        </CardText>
      </Card>
    );
  }
}

const Render = ({
  address, editAddress, onDeleteAddress, expanded,
}) => {
  return (
    <div>
      <Card style={cardSpace}>
        <CardHeader
          title={address.get('name')}
          subtitle={`Address: ${address.get('address')}`}
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText expandable={true}>
          <Row>
            <Col xs={8}>
              <DescriptionList>
                <DescriptionTitle>Description:</DescriptionTitle>
                <DescriptionData>{address.get('description')}</DescriptionData>
              </DescriptionList>
            </Col>
            <Col xs={4} md={2} mdOffset={2}>
              <QRCode value={address.get('address')} />
            </Col>
          </Row>
        </CardText>
      </Card>
      <CardEdit
        onDelete={onDeleteAddress}
        onSubmit={editAddress}
        address={address}
      />
    </div>
  );
};

const AddressShow = connect(
  (state, ownProps) => {
    const addressBook = state.addressBook.get('addressBook');
    const pos = addressBook.findKey((addr) => addr.get('address') === ownProps.address);
    return {
      address: (addressBook.get(pos) || Immutable.Map({})),
    };
  },
  (dispatch, ownProps) => ({
    editAddress: (data) => new Promise((resolve, reject) => {
      dispatch(Addressbook.actions.updateAddress(data.address, data.name, data.description))
        .then((response) => {
          resolve(response);
        });
    }),
    onDeleteAddress: () => new Promise((resolve, reject) => {
      const address = ownProps.addressId;
      dispatch(Addressbook.actions.deleteAddress(address))
        .then((response) => {
          dispatch(gotoScreen('address-book'));
          resolve(response);
        });
    }),
  })
)(Render);

export default AddressShow;
