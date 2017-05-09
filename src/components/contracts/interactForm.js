import React from 'react';
import Immutable from 'immutable';
import log from 'loglevel';
import { connect } from 'react-redux';
import { Card, CardActions, CardText, FlatButton, MenuItem, FontIcon } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import { SelectField, TextField } from 'redux-form-material-ui';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { number, required, address } from 'lib/validators';
import { code } from 'lib/styles';
import { etherToWei, toHex, estimateGasFromTrace } from 'lib/convert';
import { trackTx } from 'store/accountActions';
import { callContract, sendContractTransaction } from 'store/contractActions';
import { gotoScreen } from 'store/screenActions';

class RenderABIForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            inputs: [],
            outputs: [],
            function: undefined,
            constant: true,
            payable: false,
        };
    }

    changeInputs(event, value, prev) {
        let inputs,
            outputs;
        // if constant, read directly
        if (value.get('inputs').size > 0) {
            inputs = value.get('inputs').map((input) => Immutable.fromJS(input));
        } else {
            inputs = [];
        }
        if (value.get('constant') && value.get('outputs').size > 0) {
            outputs = value.get('outputs').map((output) => Immutable.fromJS(output));
        } else {
            outputs = [];
        }
        this.setState({
            inputs,
            outputs,
            function: value,
            constant: value.get('constant'),
            payable: value.get('payable'),
        });
    }

    updateInputVals(event, value, prev) {
        log.debug(value);
        log.debug(event.target);
        const idx = this.state.inputs.findKey((input) => input.get('name') === event.target.name);
        if (idx >= 0) {
            this.setState({
                inputs: this.state.inputs.update(idx, (input) => input.set('value', value)),
            });
        }
    }

    /*
      after callContract:
        Expect return value of executed contract
        Display decoded output params
    */
    callContract() {
        const args = this.state.inputs.reduce((res, input) => {
            res[input.get('name')] = input.get('value');
            return res;
        }, {});
        const address = this.props.contract.get('address');
        if (this.state.constant) {
            return new Promise((resolve, reject) => {
                this.props.dispatch(callContract(address,
                                this.state.function,
                                args
                )).then((result) => {
                    if (result.size > 0) {
                        const cleanDecode = result.map((res) => Immutable.fromJS(res));
                        this.setState({ outputs: cleanDecode });
                        resolve();
                    }
                });
            });
        }
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
                            {this.props.functions.map((func) =>
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
                        {this.state.inputs && this.state.inputs.map((input) =>
                        <Col xs={6}>
                            <Field key={`${this.state.function.get('name')} ${input.get('name')} IN`}
                                    name={input.get('name')}
                                    floatingLabelText={`${input.get('name')} (${input.get('type')})`}
                                    hintText={input.get('type')}
                                    component={TextField}
                                    onChange={this.updateInputVals}
                            />
                        </Col>
                        )}
                        {this.state.outputs && this.state.outputs.map((output) =>
                        <Col xs={6}>
                            <div key={`${this.state.function.get('name')} ${output.get('name')} OUT`}>
                                <b>{`${output.get('name')}`}</b> {`(${output.get('type')})`}<br />
                                <div style={code}>{(output.get('value') || ' ').toString()}</div>
                            </div>
                        </Col>
                        )}
                    </Row>
                    {!this.state.constant && <Row>
                      <Col xs={8}>
                        <Field name="from"
                               floatingLabelText="Account"
                               fullWidth={true}
                               component={SelectField}>
                          {this.props.accounts.map((account) =>
                            <MenuItem key={account.get('id')}
                                      value={account.get('id')}
                                      primaryText={account.get('id')} />
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
                           validate={[required, number]}/>
                      </Col>
                    </Row>}
                </CardText>
                <CardActions>
                    {this.state.constant && <FlatButton label="Submit"
                                disabled={this.props.pristine || this.props.submitting || this.props.invalid }
                                onClick={this.callContract}
                                icon={<FontIcon className="fa fa-check" />}/>}
                    {!this.state.constant && <FlatButton label="Submit"
                                disabled={this.props.pristine || this.props.submitting || this.props.invalid }
                                onClick={this.props.handleSubmit}
                                icon={<FontIcon className="fa fa-check" />}/>}
                    <FlatButton label="Clear"
                                onClick={this.props.reset}
                                icon={<FontIcon className="fa fa-ban" />}/>
                </CardActions>
            </Card>
        );
    }

}

const txFields = ['from', 'password', 'function', 'value', 'gasAmount'];

const InteractContractForm = reduxForm({
    form: 'interactContract',
    fields: txFields,
})(RenderABIForm);

const InteractContract = connect(
    (state, ownProps) => {
        const abi = Immutable.fromJS(ownProps.contract.get('abi'));
        const functions = abi.filter((f) =>
            (f.get('type') === 'function')
        );
        const accounts = state.accounts.get('accounts', Immutable.List());
        return {
            accounts,
            functions,
        };
    },
    (dispatch, ownProps) => ({
        onSubmit: (data) => {
            const afterTx = (txhash) => {
                const txdetails = {
                    hash: txhash,
                    account: data.from,
                };
                dispatch(trackTx(txhash));
                dispatch(gotoScreen('transaction', txdetails));
            };
            const resolver = (resolve, f) => (x) => {
                f.apply(x);
                resolve(x);
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
                const address = ownProps.contract.get('address');
                const value = data.value || 0;
                const inputs = [];
                const args = Object.keys(data)
                        .filter((key) => !txFields.includes(key))
                        .reduce((inputs, key) => {
                            inputs[key] = data[key];
                            return inputs;
                        }, {});
                log.debug(args);
                dispatch(sendContractTransaction(data.from, data.password, address,
                        toHex(data.gasAmount || 0),
                        toHex(etherToWei(value || 0)),
                        data.function,
                        args
                    )).then(resolver(afterTx, resolve));
            });
        },
    })
)(InteractContractForm);

export default InteractContract;
