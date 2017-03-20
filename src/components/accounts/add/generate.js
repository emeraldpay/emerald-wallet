import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm, reset } from 'redux-form'
import TextField from 'material-ui/TextField'
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'

import { cardSpace } from 'lib/styles'
import { Row, Col } from 'react-flexbox-grid/lib/index'

import Immutable from 'immutable'
import { gotoScreen } from 'store/screenActions'
import { loadAccountsList, createAccount } from 'store/accountActions'
import { required, minLength, passwordMatch } from 'lib/validators'
import log from 'loglevel'
import AccountShow from '../show'

const validate = values => {
    const errors = {};
    errors.password = minLength(8, values.password);
    errors.passwordConfirm = passwordMatch(values.password, values);
    return errors;
}


const renderTextField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <TextField {...input} type={type} errorText={touched && error} />
    </div>
  </div>
)


const Render = ({account, submitSucceeded, handleSubmit, invalid, pristine, reset, submitting, cancel}) => {

    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Generate Wallet'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={submitSucceeded}>
                <form onSubmit={handleSubmit}>
                    <Field  name="name" 
                            component={renderTextField} 
                            type="text" 
                            label="Account Name (optional)" />
                    <Field  name="password" 
                            component={renderTextField} 
                            type="password" 
                            label="Please Enter a Strong Password" 
                            validate={[ required, minLength(8) ]} />
                    <Field  name="passwordConfirm" 
                            component={renderTextField} 
                            type="password" 
                            label="Re-Enter Password" 
                            validate={ passwordMatch } />
                    <FlatButton label="Submit" type="submit"
                                disabled={pristine || submitting || invalid } />
                    <FlatButton label="Clear Values" 
                                disabled={pristine || submitting} 
                                onClick={reset} />
                </form>
            </CardText>
            <CardText expandable={!submitSucceeded}>
                 <AccountShow key={(account===undefined) ? undefined : account.get('id')} account={account}/>
                 <FlatButton label="Done"
                            onClick={cancel}
                            icon={<FontIcon className="fa fa-home" />}/>
            </CardText>
            <CardActions>
                <FlatButton label="Cancel"
                            onClick={cancel}
                            icon={<FontIcon className="fa fa-ban" />}/>
            </CardActions>
        </Card>
        );
}

const GenerateAccountForm = reduxForm({
    form: 'generate',
    fields: ['name', 'password', 'passwordConfirm'],
    validate
})(Render);

const GenerateAccount = connect(
    (state, ownProps) => {
        return {
            account: state.accounts.get('accounts', Immutable.List()).last()
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {                
                return new Promise((resolve, reject) => {
                    dispatch(createAccount(data.name, data.password))
                        .then((response) => {
                            console.log(response);
                            resolve(response);
                        });
                    });
            }, 
            onSubmitSuccess: result => {
                //display result
                dispatch(reset('generate'))
            },
            cancel: () => {
                dispatch(gotoScreen('home'))
            }
        }
    }
)(GenerateAccountForm);

export default GenerateAccount;