import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, reset } from 'redux-form';
import { renderTextField, renderCodeField } from 'elements/formFields';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';
import { Row, Col } from 'react-flexbox-grid/lib/index';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { addContract } from 'store/contractActions'
import { required, address } from 'lib/validators';
import log from 'loglevel';

const Render = ({account, handleSubmit, invalid, pristine, reset, submitting, deployContract}) => {

    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Add Contract'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={false}>
                <form onSubmit={handleSubmit}>
                    <Field  name="name" 
                            component={renderTextField} 
                            type="text" 
                            label="Contract Name (optional)" />
                    <Field  name="address" 
                            component={renderTextField} 
                            type="text" 
                            label="Contract Address" 
                            validate={[ required, address ]} />
                    <Field  name="abi" 
                            component={renderCodeField} 
                            rows={2}
                            type="text" 
                            label="Contract ABI / JSON Interface" 
                            validate={ required } />
                    <FlatButton label="Submit" type="submit"
                                disabled={pristine || submitting || invalid } />
                    <FlatButton label="Clear Values" 
                                disabled={pristine || submitting} 
                                onClick={reset} />
                </form>
            </CardText>
            <CardActions>
                <FlatButton label="Deploy New Contract"
                            onClick={deployContract}
                            icon={<FontIcon className="fa fa-plus-circle" />}/>
            </CardActions>
        </Card>
        );
};

const AddContractForm = reduxForm({
    form: 'addContract',
    fields: ['name', 'address', 'abi']
})(Render);

const AddContract = connect(
    (state, ownProps) => {
        return {
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {                
                return new Promise((resolve, reject) => {
                    dispatch(addContract(data.address, data.name, data.abi))
                        .then((response) => {
                            resolve(response);
                            dispatch(reset("addContract"));
                        });
                    });
            },
            deployContract: () => {
                dispatch(gotoScreen('deploy-contract'))
            }
        }
    }
)(AddContractForm);

export default AddContract;