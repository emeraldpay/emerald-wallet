import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Field, reduxForm } from 'redux-form';
import { renderTextField } from 'elements/formFields';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';

import { cardSpace } from 'lib/styles';

import Immutable from 'immutable';
import { gotoScreen } from 'store/screenActions';
import { createAccount } from 'store/accountActions';
import { required, minLength, passwordMatch } from 'lib/validators';
import { translate } from 'react-i18next';
import AccountShow from '../show';

const validate = (values) => {
    const errors = {};
    errors.password = minLength(8)(values.password);
    errors.passwordConfirm = passwordMatch(values.password, values);
    return errors;
};

const Render = translate("accounts")(({ t, account, submitSucceeded, handleSubmit, invalid, pristine, reset, submitting, cancel }) => (
    <Card style={cardSpace}>
        <CardHeader
            title={t("generate.title")}
            actAsExpander={false}
            showExpandableButton={false}
        />

        <CardText expandable={submitSucceeded}>
            <form onSubmit={handleSubmit}>
                <Field name="name"
                        component={renderTextField}
                        type="text"
                        label={t("generate.name")} />
                <Field name="description"
                        component={renderTextField}
                        type="text"
                        label={t("generate.description")} />
                <Field name="password"
                        component={renderTextField}
                        type="password"
                        label={t("generate.password")}
                        validate={[required, minLength(8)]} />
                <Field name="passwordConfirm"
                        component={renderTextField}
                        type="password"
                        label={t("generate.passwordConfirm")}
                        validate={ passwordMatch } />
                <FlatButton label={t("common:submit")} type="submit"
                            disabled={pristine || submitting || invalid } />
                <FlatButton label={t("common:clear")}
                            disabled={pristine || submitting}
                            onClick={reset} />
            </form>
        </CardText>
        <CardText expandable={!submitSucceeded}>
             <AccountShow key={(account === undefined) ? undefined : account.get('id')} account={account}/>
             <FlatButton label={t("common:done")}
                        onClick={cancel}
                        icon={<FontIcon className="fa fa-home" />}/>
        </CardText>
        <CardActions>
            <FlatButton label={t("common:cancel")}
                        onClick={cancel}
                        icon={<FontIcon className="fa fa-ban" />}
                        secondary={true} />
        </CardActions>
    </Card>
));

Render.propTypes = {
    account: PropTypes.object.isRequired,
    submitSucceeded: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    reset: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
};

const GenerateAccountForm = reduxForm({
    form: 'generate',
    fields: ['name', 'description', 'password', 'passwordConfirm'],
    validate,
})(Render);

const GenerateAccount = connect(
    (state, ownProps) => ({
        account: state.accounts.get('accounts', Immutable.List()).last(),
    }),
    (dispatch, ownProps) => ({
        onSubmit: (data) => {
            dispatch(createAccount(data.password, data.name, data.description));
        },
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
    })
)(GenerateAccountForm);

export default GenerateAccount;
