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
import log from 'loglevel';
import { gotoScreen } from 'store/screenActions';
import './main.scss';
import Screen from './screen';

const Menu = ({ openAccounts, openAddressBook, openContracts }) => (
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
  </IconMenu>
);

const Render = (props) => (
    <Grid>
        <Row>
            <Col xs={12}>
            <AppBar
                title="Emerald - Ethereum Classic Wallet"
                iconElementLeft={<IconButton><Face color="white" /></IconButton>}
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
);

const Main = connect(
    (state, ownProps) => ({}),
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
    })
)(Render);

export default Main;
