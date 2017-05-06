import React from 'react';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { Card, CardActions, CardText, FlatButton, MenuItem, FontIcon } from 'material-ui';
import { Field, reduxForm } from 'redux-form';
import { SelectField, TextField } from 'redux-form-material-ui';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { number, required, address } from 'lib/validators';

class RenderABIForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = { inputs: [] };
    }

    changeInputs = (event, value, prev) => {
        const inputs = value.map( (input) => Immutable.fromJS(input) )
        this.setState({ inputs: inputs })
    }

    render() {
        console.log(this.props)
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
                                      value={func.get('inputs')} 
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
                            <Field  key={input.get('name')}
                                    name={input.get('name')}
                                    floatingLabelText={`${input.get('name')} (${input.get('type')})`}
                                    hintText={input.get('type')}
                                    component={TextField}
                            />
                        </Col>
                        )}
                    </Row>
                    <Row>
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
                    </Row>
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


const Render = ({contract, functions, invalid, submitting, cancel}) => {
    return (
        <div>
            <ABISelectionForm functions={functions} />
        </div>
    )
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

        }
    }
)(InteractContractForm);

export default InteractContract;