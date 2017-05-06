import React from 'react';
import Immutable from 'immutable';
import log from 'loglevel';
import { connect } from 'react-redux';
import { Card, CardActions, CardText, FlatButton, MenuItem, FontIcon } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import { SelectField, TextField } from 'redux-form-material-ui';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { number, required, address } from 'lib/validators';
import { etherToWei, toHex, estimateGasFromTrace } from 'lib/convert';

class RenderABIForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = { 
            inputs: [], 
            outputs: [], 
            function: undefined, 
            constant: true,
            payable: false
        };
    }

    changeInputs = (event, value, prev) => {
        let inputs, outputs;
        // if constant, read directly
        if (value.get('inputs').size > 0)
            inputs = value.get('inputs').map( (input) => Immutable.fromJS(input) )
        else
            inputs = []
        if (value.get('constant') && value.get('outputs').size > 0)
            outputs = value.get('outputs').map( (output) => Immutable.fromJS(output) )
        else
            outputs = []
        this.setState({ 
            inputs: inputs, 
            outputs: outputs, 
            function: value.get('name'),
            constant: value.get('constant'),
            payable: value.get('payable')
        })
    }

    render() {
        return (
            <Card>
                <CardText>
                    <Row>
                        <Col xs={12}>
                            <Field name="function"
                                   floatingLabelText="Function"
                                   component={SelectField}
                                   onChange={this.changeInputs}
                            >
                            {this.props.functions.map( (func) =>
                            <MenuItem key={func.get('name')} 
                                      value={func} 
                                      label={func.get('name')} 
                                      primaryText={func.get('name')} 
                            />
                            )}
                            </Field>
                        </Col>
                    </Row>
                    <Row>
                        {this.state.inputs && this.state.inputs.map( (input) => 
                        <Col xs={6}>
                            <Field  key={`${this.state.function} ${input.get('name')} IN`}
                                    name={input.get('name')}
                                    floatingLabelText={`${input.get('name')} (${input.get('type')})`}
                                    hintText={input.get('type')}
                                    component={TextField}
                            />
                        </Col>
                        )}
                        {this.state.outputs && this.state.outputs.map( (output) => 
                        <Col xs={6}>
                            <Field  key={`${this.state.function} ${output.get('name')} OUT`}
                                    disabled={true}
                                    name={output.get('name')}
                                    floatingLabelText={`${output.get('name')}`}
                                    component={TextField}
                            />
                        </Col>
                        )}
                    </Row>
                    {!this.state.constant && <Row>
                      <Col xs={8}>
                        <Field name="from"
                               floatingLabelText="Account"
                               fullWidth={true}
                               component={SelectField}>
                          {this.props.accounts.map( (account) =>
                            <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                          )}
                        </Field>
                      </Col>
                      <Col xs={8}>
                        <Field name="password"
                           floatingLabelText="Password"
                           type="password"
                           component={TextField}
                           validate={required}/>
                      </Col>                    
                    </Row>}
                    {!this.state.constant && <Row>
                      {this.state.payable && <Col xs={8}>
                        <Field name="value"
                               floatingLabelText="Value to Send"
                               hintText="0"
                               component={TextField} />
                      </Col>}
                      <Col xs={8}>
                        <Field name="gasAmount"
                           floatingLabelText="Gas Amount"
                           component={TextField}
                           validate={[ required, number ]}/>
                      </Col>    
                    </Row>}
                </CardText>
                <CardActions>
                    <FlatButton label="Submit"
                                disabled={this.props.pristine || this.props.submitting || this.props.invalid }
                                onClick={this.props.handleSubmit}
                                icon={<FontIcon className="fa fa-check" />}/>
                    <FlatButton label="Clear"
                                onClick={this.props.reset}
                                icon={<FontIcon className="fa fa-ban" />}/>
                </CardActions>
            </Card>
        )
    }

}

const InteractContractForm = reduxForm({
  form: 'interactContract',
  fields: ['from', 'password', 'function']
})(RenderABIForm);

const InteractContract = connect(
    (state, ownProps) => {
        const abi = Immutable.fromJS(ownProps.contract.get('abi'))
        const functions = abi.filter( (f) => 
            (f.get("type") === "function") 
        )
        const accounts = state.accounts.get('accounts', Immutable.List())
        return {
            accounts: accounts,
            functions: functions
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {
                log.debug(data);
                
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
                /* TODO: Validate transaction, gas 
                return traceValidate(data, dispatch)
                    .then((result) => {
                        if (result) {
                            throw new SubmissionError(result)
                        } else {
                            return new Promise()
                        }
                    })
                */
                return new Promise((resolve, reject) => {
                    const address = ownProps.contract.get('address')
                    const value = data.value || 0;
                    dispatch(callContract(data.from, data.password, address,
                        toHex(data.gasAmount), 
                        toHex(etherToWei(value))
                    )).then(resolver(afterTx, resolve));
                })
            }
        }
    }
)(InteractContractForm);

export default InteractContract;