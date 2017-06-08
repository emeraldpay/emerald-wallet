import React from 'react';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import log from 'loglevel';
import Networks from 'lib/networks';
import { translate } from 'react-i18next';
import { switchChain } from 'store/networkActions';
import { gotoScreen } from 'store/screenActions';
import './main.scss';
import Screen from './screen';
import Header from './layout/header';

const Render = translate("common")(({t, ...props}) => (
    <Grid>
        <Row>
            <Col xs={12}>
                <Header/>
            </Col>
        </Row>
        <Row>
            <Col xs={12}>
                <Screen id="body"/>
            </Col>
        </Row>
        <Row>
            <Col xs={12}>
                <div id="footer">
                    Emerald Wallet, Ethereum Classic, 2017<br/>
                    <FlatButton label="Fork on GitHub"
                                backgroundColor="#505050"
                                href="https://github.com/ethereumproject/emerald-wallet"
                                icon={<FontIcon className="fa fa-github" />}/>
                </div>
            </Col>
        </Row>
    </Grid>
));

const Main = connect(
    (state, ownProps) => ({
        chain: (state.network.get('chain') || {}).get('name'),
        networks: Networks,
    }),
    (dispatch, ownProps) => ({
        openAccounts: () => {
            log.info('accounts');
            dispatch(gotoScreen('home'));
        },
        openAddressBook: () => {
            log.info('address book');
            dispatch(gotoScreen('address-book'));
        },
        openContracts: () => {
            log.info('contracts');
            dispatch(gotoScreen('contracts'));
        },
        switchChain: (network) => {
            dispatch(switchChain(network.get('name'), network.get('id')));
        },
    })
)(Render);

export default Main;
