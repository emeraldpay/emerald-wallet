import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'
import TextField from 'material-ui/TextField'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'

import { cardSpace } from 'lib/styles'
import { Row, Col } from 'react-flexbox-grid/lib/index'

import { gotoScreen } from 'store/screenActions'
import { loadAccountsList, createAccount } from 'store/accountActions'
import { required, password, passwordMatch } from 'lib/validators'
import log from 'loglevel'

const validate = values => {
    const errors = {};
    errors.password = password(values.password);
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


const Render = ({handleSubmit, invalid, pristine, reset, submitting, cancel}) => {
        
    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Generate Wallet'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={false}>
                <form onSubmit={handleSubmit}>
                    <Field  name="name" 
                            component={renderTextField} 
                            type="text" 
                            label="Account Name (optional)" />
                    <Field  name="password" 
                            component={renderTextField} 
                            type="password" 
                            label="Please Enter a Strong Password" 
                            validate={[ required, password ]} />
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
            initialValues: {
            }
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {                
                dispatch(createAccount(data.name, data.password));
                // display account ID, click DONE to go home
            }, 
            // when done, dispatch(loadAccountsList());
            cancel: () => {
                dispatch(gotoScreen('home'))
            }
        }
    }
)(GenerateAccountForm);

export default GenerateAccount;