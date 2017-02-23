import React from 'react';
import { connect } from 'react-redux'
import { Field, reduxForm } from 'redux-form'

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card'
import TextField from 'material-ui/TextField'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'

import { cardSpace } from '../../lib/styles'
import { Row, Col } from 'react-flexbox-grid/lib/index'

import { open } from '../../store/screenActions'
import { positive, number, required, address } from '../../lib/validators'
import log from 'loglevel'

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
    <TextField hintText={label}
               floatingLabelText={label}
               errorText={touched && error}
               {...input}
               {...custom}
    />
);

const renderSelectField = ({ input, label, meta: { touched, error }, children, ...custom }) => (
    <SelectField
        errorText={touched && error}
        floatingLabelText={label}
        {...input}
        onChange={(event, index, value) => input.onChange(value)}
        children={children}
        {...custom}
    />
);



const Render = ({fields: {from, to}, account, handleSubmit, resetForm, submitting, cancel}) => {
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
                                       component={renderSelectField}
                                       fullWidth={true}>
                                    <MenuItem value={account.get('id')} primaryText={account.get('id')} />
                                </Field>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Field name="to"
                                       component={renderTextField}
                                       floatingLabelText="Target Address"
                                       hintText="0x0000000000000000000000000000000000000000"
                                       fullWidth={true}
                                       validate={[required, address]}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Field name="value"
                                       component={renderTextField}
                                       floatingLabelText="Amount (Ether)"
                                       hintText="1.0000"
                                       defaultValue={0.0}
                                       validate={[required, number, positive]}
                                />
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={12} md={6}>
                        <Row>
                            <Col xs={12}>
                                <Field name="gasPrice"
                                       component={renderTextField}
                                       floatingLabelText="Gas Price (MGas)"
                                       hintText="10000"
                                       validate={[required, number, positive]}
                                />
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={12}>
                                <Field name="gasAmount"
                                       component={renderTextField}
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
    fields: ['to', 'from', 'value', 'gasPrice', 'gasAmount']
})(Render);

const CreateTx = connect(
    (state, ownProps) => {
        return {
            initialValues: {
                from: ownProps.account.get('id'),
                gasPrice: 10000,
                gasAmount: 21000
            }
        }
    },
    (dispatch, ownProps) => {
        return {
            cancel: () => {
                dispatch(open('home'))
            }
        }
    }
)(CreateTxForm);



export default CreateTx