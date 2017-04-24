import React from 'react';
import { connect } from 'react-redux';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Create from 'material-ui/svg-icons/content/create';
import Block from 'material-ui/svg-icons/content/block';
import DeleteSweep from 'material-ui/svg-icons/content/delete-sweep';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData} from '../../elements/dl';
import QRCode from 'qrcode.react';
import log from 'loglevel';
import Immutable from 'immutable';
import { cardSpace } from 'lib/styles';
import { updateAddress, deleteAddress } from '../../store/addressActions';
import { gotoScreen } from '../../store/screenActions';
import AddressEdit from './edit';


class CardEdit extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
    };
  }

  handleExpandChange = (expanded) => {
    this.setState({expanded: expanded});
  };

  handleExpand = () => {
    this.setState({expanded: true});
  };

  handleReduce = () => {
    this.setState({expanded: false});
  };

  render() {
    return (
      <Card style={cardSpace} expanded={this.state.expanded} onExpandChange={this.handleExpandChange}>
        <CardActions>
            <FlatButton label="Edit"
                        onClick={this.handleExpand}
                        icon={<Create />}/>
            <FlatButton label="Forget"
                        onClick={this.props.onDelete}
                        icon={<DeleteSweep />}/>                            
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

const Render = ({address, editAddress, deleteAddress, expanded}) => {

    const value = (address.get('balance') ? address.get('balance').getEther() : '?') + ' Ether';

    return (
        <div>
            <Card style={cardSpace}>
                <CardHeader
                    title={address.get('name')}
                    subtitle={'Address: ' + address.get('id')}
                    actAsExpander={true}
                    showExpandableButton={true}
                />
                <CardText expandable={true}>
                    <Row>
                        <Col xs={8}>
                            <DescriptionList>
                                <DescriptionTitle>Description:</DescriptionTitle>
                                <DescriptionData>{address.get('description')}</DescriptionData>

                                <DescriptionTitle>Ether Balance:</DescriptionTitle>
                                <DescriptionData>{value}</DescriptionData>

                            </DescriptionList>
                        </Col>
                        <Col xs={4} md={2} mdOffset={2}>
                            <QRCode value={address.get('id')} />
                        </Col>
                    </Row>                              
                </CardText>
            </Card>
            <CardEdit onDelete={deleteAddress} onSubmit={editAddress} address={address} />
        </div>       
    )
};

const AddressShow = connect(
    (state, ownProps) => {
        let addressBook = state.addressBook.get('addressBook');
        let pos = addressBook.findKey((addr) => addr.get('id') === ownProps.address.get('id'));
        return {
            address: addressBook.get(pos)
        }
    },
    (dispatch, ownProps) => {
        return {
            editAddress: (data) => {
                return new Promise((resolve, reject) => {
                    dispatch(updateAddress(data.address, data.name, data.description))
                        .then((response) => {
                            resolve(response);
                        });
                    });
            },
            deleteAddress: () => {
                console.log("delete")
            }
        }
    }
)(Render);

export default AddressShow