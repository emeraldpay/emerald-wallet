import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';

import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { List, ListItem } from 'material-ui/List';

import { cardSpace } from 'lib/styles';
import { translate } from 'react-i18next';
import { gotoScreen } from 'store/screenActions';
import { watchConnection } from 'store/ledgerActions';

const Render = translate("accounts")(({ t, handleSubmit, submitting, generate, importJson, importLedger, cancel }) => (
    <Card style={cardSpace}>
        <CardHeader
            title={t("add.title")}
            actAsExpander={false}
            showExpandableButton={false}
        />

        <CardText expandable={false}>
            <List>
                <ListItem
                    primaryText="Ledger Nano S"
                    secondaryText="Use Ledger hardware key to manage signatures"
                    onClick={importLedger}
                    leftIcon={<FontIcon className="fa fa-usb"/>}
                />
                <ListItem
                    primaryText={t("add.generate.title")}
                    secondaryText={t("add.generate.subtitle")}
                    onClick={generate}
                    leftIcon={<FontIcon className="fa fa-random"/>}
                />
                <ListItem
                    primaryText={t("add.import.title")}
                    secondaryText={t("add.import.subtitle")}
                    onClick={importJson}
                    leftIcon={<FontIcon className="fa fa-code"/>}
                />
            </List>

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
    handleSubmit: PropTypes.func.isRequired,
    generate: PropTypes.func.isRequired,
    importJson: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
};

const CreateAccountForm = reduxForm({
    form: 'createAccount',
    fields: ['name'],
})(Render);

const CreateAccount = connect(
    (state, ownProps) => ({
        initialValues: {
        },
    }),
    (dispatch, ownProps) => ({
        cancel: () => {
            dispatch(gotoScreen('home'));
        },
        generate: () => {
            dispatch(gotoScreen('generate'));
        },
        importJson: () => {
            dispatch(gotoScreen('importjson'));
        },
        importLedger: () => {
            dispatch(gotoScreen('add-from-ledger'));
            dispatch(watchConnection());
        }
    })
)(CreateAccountForm);


export default CreateAccount;
