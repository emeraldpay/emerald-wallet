import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form/immutable'
import TextField from 'material-ui/TextField'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'

import { cardSpace } from 'lib/styles'
import { Row, Col } from 'react-flexbox-grid/lib/index'

import { gotoScreen } from 'store/screenActions'
import { positive, number, required, address } from 'lib/validators'
import log from 'loglevel'

const renderTextField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <TextField {...input} type={type}/>
      {touched && error && <span>{error}</span>}
    </div>
  </div>
)


const Render = ({handleSubmit, pristine, reset, submitting, cancel}) => {
        
    return (
        <Card style={cardSpace}>
            <CardHeader
                title='Generate Wallet'
                actAsExpander={false}
                showExpandableButton={false}
            />

            <CardText expandable={false}>
                <form onSubmit={handleSubmit}>
                    <Field name="name" component={renderTextField} type="text" label="Account Name (optional)"/>
                    <Field name="password" component={renderTextField} type="password" label="Please Enter a Strong Password"/>
                    <Field name="password-conf" component={renderTextField} type="password" label="Re-Enter Password"/>
                    <FlatButton label="Submit" disabled={pristine || submitting}/>
                    <FlatButton label="Clear Values" disabled={pristine || submitting} onClick={reset}/>
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
    fields: []
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
            cancel: () => {
                dispatch(gotoScreen('home'))
            }
        }
    }
)(GenerateAccountForm);

export default GenerateAccount;