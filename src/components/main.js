import React from 'react';
import { connect } from 'react-redux';
import AppBar from 'material-ui/AppBar';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import ExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import Face from 'material-ui/svg-icons/action/face';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import LibraryBooks from 'material-ui/svg-icons/av/library-books';
import Motorcycle from 'material-ui/svg-icons/action/motorcycle';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import log from 'loglevel';
import Networks from 'lib/networks';
import { translate } from 'react-i18next';
import { switchChain } from 'store/networkActions';
import { gotoScreen } from 'store/screenActions';
import './main.scss';
import Screen from './screen';

const Menu = ({ openAccounts, openAddressBook, openContracts, switchChain, networks, chain }) => (
  <IconMenu
    iconButtonElement={
      <IconButton><ExpandMoreIcon color="white" /></IconButton>
    }
    targetOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
  >
    <MenuItem leftIcon={<Face />} primaryText="Home" onClick={openAccounts} />
    <MenuItem leftIcon={<ImportContacts />} primaryText="Address Book" onClick={openAddressBook} />
    <MenuItem leftIcon={<LibraryBooks />} primaryText="Contracts" onClick={openContracts} />
    <MenuItem
        leftIcon={<Motorcycle />}
        primaryText="Network"
        rightIcon={<ArrowDropRight />}
        menuItems=
            {networks.map((net) =>
              <MenuItem
                key={net.get('id')}
                primaryText={net.get('name')}
                checked={(net.get('name') === chain)}
                onClick={() => (net.get('name') !== chain) && switchChain(net)}
              />
            )}

    />
  </IconMenu>
);

const Render = translate("common")(({t, ...props}) => (
    <Grid>
        <Row>
            <Col xs={12}>
            <AppBar
                title={t("appName")}
                iconElementLeft={<IconButton onClick={props.openAccounts}><Face color="white" /></IconButton>}
                iconElementRight={<Menu {...props}/>}
            />
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
