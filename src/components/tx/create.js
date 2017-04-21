import React from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, change, formValueSelector, SubmissionError } from 'redux-form';

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { SelectField, TextField, RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton} from 'material-ui/RadioButton';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from '../../lib/styles';
import { Row, Col } from 'react-flexbox-grid/lib/index';

import { sendTransaction, trackTx } from 'store/accountActions';
import { transferTokenTransaction, traceTokenTransaction, traceCall } from 'store/tokenActions';
import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { positive, number, required, address } from 'lib/validators';
import { mweiToWei, etherToWei, toHex } from 'lib/convert';
import log from 'loglevel';

const DefaultGas = 21000;
const DefaultTokenGas = 23890;

const traceValidate = (data, dispatch) => {
    const resolver = (f, res, rej) => {
        return (x) => f(x,res,rej)
    }
    const resolveValidate = (response, resolve) => {
        let errors = {};
        console.log(response)
        if(!response) { // null response, error
            errors.value = "Invalid Transaction"
        }
        const gas = (((response.trace || [])[0] || {}).action || {}).gas;
        if (gas > toHex(data.gasAmount))
            errors.gasAmount = "Insufficient gas"
        if(Object.keys(errors).length === 0) errors = null;
        resolve(errors)
    };
    if (data.token.length > 1)
        return new Promise((resolve, reject) => {
            dispatch(traceTokenTransaction(data.from, data.password, 
                data.to, toHex(data.gasAmount), 
                toHex(mweiToWei(data.gasPrice)),
                toHex(etherToWei(data.value)),
                data.token, data.isTransfer
            )).then(resolver(resolveValidate, resolve));
        });
    else
        return new Promise((resolve, reject) => {
            dispatch(traceCall(data.from, data.password, data.to,
                toHex(data.gasAmount), toHex(mweiToWei(data.gasPrice)),
                toHex(etherToWei(data.value))
            )).then(resolver(resolveValidate, resolve));
        })
};

const Render = ({fields: {from, to}, accounts, account, tokens, token, isToken, onChangeToken, handleSubmit, invalid, pristine, resetForm, submitting, cancel}) => {
    log.debug('fields - from', from);

    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Send Transaction'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={false}>
                <Row>
                    <Col xs={12} md={6}>
                        <Row>
                            <Col xs={12}>
                                <Field name="from"
                                       floatingLabelText="From"
                                       component={SelectField}
                                       fullWidth={true}>
                                       {accounts.map( (account) => 
                                        <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                                        )}
                                </Field>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Field name="password"
                                       floatingLabelText="Password"
                                       type="password"
                                       component={TextField}
                                       fullWidth={true}
                                       validate={required}>
                                </Field>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Field name="to"
                                       component={TextField}
                                       floatingLabelText="Target Address"
                                       hintText="0x0000000000000000000000000000000000000000"
                                       fullWidth={true}
                                       validate={[required, address]}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={8} md={6}>
                                <Field name="value"
                                       component={TextField}
                                       floatingLabelText="Amount"
                                       hintText="1.0000"
                                       validate={[required, number]}
                                />
                            </Col>
                            <Col xs={4} md={4}>
                                <Field name="token"
                                       component={SelectField}
                                       onChange={onChangeToken}
                                       value={token}
                                       fullWidth={true}>
                                       {tokens.map( (token) => 
                                        <MenuItem key={token.get('address')} value={token.get('address')} label={token.get('symbol')} primaryText={token.get('symbol')} />
                                        )}
                                </Field>
                            </Col>
                            {isToken && 
                            <Col>
                                <Field name="isTransfer"  
                                    component={RadioButtonGroup}
                                    defaultSelected="true"
                                    validate={required}>
                                  <RadioButton value="true" label="Transfer"/>
                                  <RadioButton value="false" label="Approve for Withdrawal"/>
                                </Field>
                            </Col> }   
                        </Row>
                    </Col>

                    <Col xs={12} md={6}>
                        <Row>
                            <Col xs={12}>
                                <Field name="gasPrice"
                                       component={TextField}
                                       floatingLabelText="Gas Price (MGas)"
                                       hintText="10000"
                                       validate={[required, number, positive]}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Field name="gasAmount"
                                       component={TextField}
                                       floatingLabelText="Gas Amount"
                                       hintText="21000"
                                       validate={[required, number, positive]}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>

            </CardText>

            <CardActions>
                <FlatButton label="Send"
                            disabled={pristine || submitting || invalid }
                            onClick={handleSubmit}
                            icon={<FontIcon className="fa fa-check" />}/>
                <FlatButton label="Cancel"
                            onClick={cancel}
                            icon={<FontIcon className="fa fa-ban" />}/>
            </CardActions>
        </Card>
    )
};

const CreateTxForm = reduxForm({
    form: 'createTx',
    fields: ['to', 'from', 'password', 'value', 'token', 'gasPrice', 'gasAmount', 'token', 'isTransfer']
})(Render);

const CreateTx = connect(
    (state, ownProps) => {
        const selector = formValueSelector('createTx');
        let tokens = state.tokens.get('tokens');
        return {
            initialValues: {
                from: ownProps.account.get('id'),
                gasPrice: 10000,
                gasAmount: DefaultGas,
                token: '',
                isTransfer: "true"
            },
            accounts: state.accounts.get('accounts', Immutable.List()),
            tokens: tokens.unshift(Immutable.fromJS({'address': '', 'symbol': 'ETC'})),
            isToken: (selector(state, 'token'))
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {
                console.log(data);
                const afterTx = (txhash) => {
                    let txdetails = {
                        hash: txhash,
                        account: data.from 
                    };
                    dispatch(trackTx(txhash));
                    dispatch(gotoScreen('transaction', txdetails));
                };
                const resolver = (resolve, f) => {
                    return (x) => {
                        f.apply(x);
                        resolve(x);
                    }
                };                
                return traceValidate(data, dispatch)
                    .then((result) => {
                        if(result)
                            throw new SubmissionError(result)
                        else {
                            console.log("go on")
                            if (data.token.length > 1)
                                return new Promise((resolve, reject) => {
                                    dispatch(transferTokenTransaction(data.from, data.password, 
                                        data.to, toHex(data.gasAmount), 
                                        toHex(mweiToWei(data.gasPrice)),
                                        toHex(etherToWei(data.value)),
                                        data.token, data.isTransfer))
                                        .then(resolver(afterTx, resolve));
                                    });
                            else
                                return new Promise((resolve, reject) => {
                                    dispatch(sendTransaction(data.from, data.password, data.to,
                                        toHex(data.gasAmount), toHex(mweiToWei(data.gasPrice)),
                                        toHex(etherToWei(data.value))
                                    )).then(resolver(afterTx, resolve));
                                })
                        }

                    }) 
            },
            onChangeToken: (event, value, prev) => {
                // if switching from ETC to token, change default gas
                if (prev.length < 1 && !(address(value))) 
                    dispatch(change("createTx", "gasAmount", DefaultTokenGas));
                else if (!(address(prev)) && value.length < 1) 
                    dispatch(change("createTx", "gasAmount", DefaultGas))
                
            },
            cancel: () => {
                dispatch(gotoScreen('home'))
            }
        }
    }
)(CreateTxForm);



export default CreateTx