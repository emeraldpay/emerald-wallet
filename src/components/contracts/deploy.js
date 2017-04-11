import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, reset } from 'redux-form';
import { renderCodeField, renderCheckboxField } from 'elements/formFields';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { SelectField, TextField } from 'redux-form-material-ui';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';
import { Row, Col } from 'react-flexbox-grid';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { createContract, trackTx } from 'store/accountActions';
import { addContract } from 'store/contractActions';
import { positive, number, required, address, hex } from 'lib/validators';
import { mweiToWei, etherToWei, toHex } from 'lib/convert';
import log from 'loglevel';

const DefaultGas = 300000;
const OptionValues = ['ERC20', 'ERC23'];

const Render = ({fields: {from, options}, optionVals, accounts, handleSubmit, invalid, pristine, reset, submitting, cancel}) => {
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
                    <Col>
                        <Field name="from"
                               floatingLabelText="From"
                               component={SelectField}
                               validate={ [required, address] } >
                               {accounts.map( (account) => 
                                <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                                )}
                        </Field>
                        <Field  name="bytecode" 
                                component={renderCodeField} 
                                rows={4}
                                type="text" 
                                label="Bytecode" 
                                validate={ [required, hex] } />
                        <Field name="gasPrice"
                               type="number"
                               component={TextField}
                               floatingLabelText="Gas Price (MGas)"
                               hintText="10000"
                               validate={[required, number, positive]}
                        />
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
                    <Col>
                        <Card>
                            <CardHeader
                              title="Other Options"
                              actAsExpander={true}
                              showExpandableButton={true}
                            />
                            <CardText expandable={true}>
                                <Field  name="name" 
                                        component={TextField} 
                                        type="text" 
                                        floatingLabelText="Contract Name" />
                                <Field name="version"
                                       type="number"
                                       component={TextField}
                                       floatingLabelText="Version"
                                       hintText="1.0000"
                                />
                                <Field  name="abi" 
                                        component={renderCodeField} 
                                        rows={2}
                                        type="text" 
                                        label="Contract ABI / JSON Interface"
                                        validate={hex} />
                                <Field  name="options" 
                                        options={optionVals} 
                                        component={renderCheckboxField} />
                            </CardText>
                        </Card>
                    </Col>
                </Row>


            </CardText>
            <CardActions>
                <FlatButton label="Submit" 
                            onClick={handleSubmit}
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
    fields: ['from', 'bytecode', 'options']
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
                const afterTx = (txhash) => {
                    let txdetails = {
                        hash: txhash,
                        account: data.from
                    };
                    dispatch(addContract(null, data.name, data.abi, data.version, data.options, txhash))
                    dispatch(trackTx(txhash));
                    dispatch(gotoScreen('transaction', txdetails));
                };
                const resolver = (resolve, f) => {
                    return (x) => {
                        f.apply(x);
                        resolve(x);
                    }
                };
                return new Promise((resolve, reject) => {
                    dispatch(createContract(data.from, 
                        toHex(data.gasAmount), toHex(mweiToWei(data.gasPrice)),
                        data.bytecode
                    )).then(resolver(afterTx, resolve));
                })
            },
            cancel: () => {
                dispatch(gotoScreen('contracts'))
            }
        }
    }
)(DeployContractForm);

export default DeployContract;