import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, reset } from 'redux-form';
import { renderTextField, renderCodeField, renderSelectField, renderCheckboxField } from 'elements/formFields';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { TextField } from 'redux-form-material-ui';
import Checkbox from 'material-ui/Checkbox';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';
import { Row, Col } from 'react-flexbox-grid';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { positive, number, required, address } from 'lib/validators';
import log from 'loglevel';

const DefaultGas = 300000;
const OptionValues = ['ERC20', 'ERC23'];

const Render = ({fields: {from, to, options}, optionVals, accounts, onSubmit, invalid, pristine, reset, submitting, cancel}) => {
    log.debug('fields - from', from);

    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Deploy Contract'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={false}>

                <Row>
                    <Col xs={12} sm={6} md={3} lg={1}>
                        <Field name="from"
                               label="From"
                               component={renderSelectField}>
                               {accounts.map( (account) => 
                                <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                                )}
                        </Field>
                    </Col>
                    <Col xs={12} sm={6} md={3} lg={1}>
                        <Field  name="name" 
                                component={renderTextField} 
                                type="text" 
                                label="Contract Name (optional)" />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Field  name="bytecode" 
                                component={renderCodeField} 
                                rows={4}
                                type="text" 
                                label="Bytecode" 
                                validate={ required } />
                        <Field  name="abi" 
                                component={renderCodeField} 
                                rows={2}
                                type="text" 
                                label="Contract ABI / JSON Interface (optional)" />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12}>
                        <Field name="gasPrice"
                               type="number"
                               component={TextField}
                               floatingLabelText="Gas Price (MGas)"
                               hintText="10000"
                               validate={[required, number, positive]}
                        />
                    </Col>
                    <Col xs={12}>
                        <Field name="gasAmount"
                               type="number"
                               component={TextField}
                               floatingLabelText="Gas Amount"
                               hintText="21000"
                               validate={[required, number, positive]}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col xs>
                        <Field name="version"
                               type="number"
                               component={TextField}
                               floatingLabelText="Version (optional)"
                               hintText="1.0000"
                        />
                    </Col>
                    <Col xs>
                        <Field  name="options" 
                                label="Options"
                                options={optionVals} 
                                component={renderCheckboxField} />
                    </Col>
                </Row>


            </CardText>
            <CardActions>
                <FlatButton label="Submit" type="submit"
                            disabled={pristine || submitting || invalid } />
                <FlatButton label="Clear Values" 
                            disabled={pristine || submitting} 
                            onClick={reset} />            
                <FlatButton label="Cancel"
                            onClick={cancel}
                            icon={<FontIcon className="fa fa-ban" />}/>
            </CardActions>
        </Card>
        );
};

const DeployContractForm = reduxForm({
    form: 'deployContract',
    fields: ['from', 'name', 'abi', 'bytecode', 'options']
})(Render);

const DeployContract = connect(
    (state, ownProps) => {
        return {
            initialValues: {
                gasPrice: 10000,
                gasAmount: DefaultGas,
                options: []
            },
            accounts: state.accounts.get('accounts', Immutable.List()),
            optionVals: OptionValues
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {         
                console.log(data)       
                return new Promise((resolve, reject) => {
                    dispatch(deployContract(data.address, data.name, data.abi))
                        .then((response) => {
                            resolve(response);
                            dispatch(reset("addContract"));
                        });
                    });
            },
            cancel: () => {
                dispatch(gotoScreen('contracts'))
            }
        }
    }
)(DeployContractForm);

export default DeployContract;