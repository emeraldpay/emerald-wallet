import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody } from 'material-ui/Table';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { cardSpace, noShadow, align } from 'lib/styles';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import { gotoScreen } from 'store/screenActions';
import Account from './account';
import { watchConnection } from 'store/ledgerActions';
import {Menu, MenuItem, Popover} from 'material-ui';
import { List, ListItem } from 'material-ui/List';

class WalletsTokensButton extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
        this.handleTouchTap = this.handleTouchTap.bind(this);
        this.handleRequestClose = this.handleRequestClose.bind(this);
    }

    handleTouchTap(event) {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    }

    handleRequestClose() {
        this.setState({
            open: false,
        });
    }

    render() {
        const {generate, importJson, importLedger, t, style} = this.props;

        return (

            <div style={style}>
                <FlatButton
                    onTouchTap={this.handleTouchTap}
                    label="WALLETS AND TOKENS"
                    labelStyle={{paddingRight: 0, float: 'right'}}
                    style={{
                        color: '#47B04B',
                    }}
                    hoverColor="transparent"
                    icon={<FontIcon className="fa fa-plus-circle" />}
                />
                <Popover
                    open={this.state.open}
                    anchorEl={this.state.anchorEl}
                    anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                    targetOrigin={{horizontal: 'left', vertical: 'top'}}
                    onRequestClose={this.handleRequestClose}
                >
                    <List>
                    <ListItem
                        primaryText="Ledger Nano S"
                        secondaryText="Use Ledger hardware key to manage signatures"
                        onClick={importLedger}
                        leftIcon={<FontIcon className="fa fa-usb"/>}
                    />
                    <ListItem
                        primaryText={t('add.generate.title')}
                        secondaryText={t('add.generate.subtitle')}
                        onClick={generate}
                        leftIcon={<FontIcon className="fa fa-random"/>}
                    />
                    <ListItem
                        primaryText={t('add.import.title')}
                        secondaryText={t('add.import.subtitle')}
                        onClick={importJson}
                        leftIcon={<FontIcon className="fa fa-code"/>}
                    />
                    </List>
                </Popover>
            </div>
        );
    }
}

const Render = translate('accounts')(({ t, accounts, generate, importJson, importLedger, connecting }) => {
    if (connecting) {
        return (
            <div id="accounts-list">
                <Grid>
                <Row center="xs">
                    <Col xs={3}>
                        <i className="fa fa-spin fa-spinner"/> Loading...
                    </Col>
                </Row>
                </Grid>
            </div>
        );
    }

    const table = <div>
        {accounts.map((account) => <Account key={account.get('id')} account={account}/>)}
    </div>;


    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', height: '66px'}}>
                <div><span style={{fontSize: '14px', fontWeight: 500, color: '#191919'}}>{t('list.title')}</span></div>
                <WalletsTokensButton
                    generate={generate}
                    importJson={importJson}
                    importLedger={importLedger}
                    t={t}
                />
            </div>
            <div style={{}}>
                {table}
            </div>
        </div>
    );
});

Render.propTypes = {
    accounts: PropTypes.object.isRequired,
    connecting: PropTypes.bool.isRequired,
    generate: PropTypes.func.isRequired,
    importJson: PropTypes.func.isRequired,
    importLedger: PropTypes.func.isRequired,
};

const AccountsList = connect(
    (state, ownProps) => ({
        accounts: state.accounts.get('accounts', Immutable.List()),
        connecting: state.launcher.get('connecting'),
    }),
    (dispatch, ownProps) => ({
        generate: () => {
            dispatch(gotoScreen('generate'));
        },
        importJson: () => {
            dispatch(gotoScreen('importjson'));
        },
        importLedger: () => {
            dispatch(gotoScreen('add-from-ledger'));
        },

    })
)(Render);

export default AccountsList;
