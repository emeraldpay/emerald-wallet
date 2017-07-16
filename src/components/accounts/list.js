import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table, TableBody } from 'material-ui/Table';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Avatar from 'material-ui/Avatar';
import { cardSpace, noShadow, align } from 'lib/styles';
import Immutable from 'immutable';
import { translate } from 'react-i18next';
import { gotoScreen } from 'store/screenActions';
import Account from './account';

import {Menu, MenuItem, Popover} from 'material-ui';

class WalletsTokensButton extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            open: false,
        };
    }

    handleTouchTap = (event) => {
        // This prevents ghost click.
        event.preventDefault();

        this.setState({
            open: true,
            anchorEl: event.currentTarget,
        });
    };

    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    };

    render() {
        const {createAccount, t, style} = this.props;

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
                        <MenuItem primaryText={t('list.create')} onClick={createAccount} />
                </Popover>
            </div>
        );
    }
}

const Render = translate('accounts')(({ t, accounts, createAccount, connecting }) => {

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

    const table = <Table selectable={false}>
        <TableBody displayRowCheckbox={false}>
            {accounts.map((account) => <Account key={account.get('id')} account={account}/>)}
        </TableBody>
    </Table>;

    const titleStyle = {
        fontSize: '20px',
    };
    const titleAvatar = <Avatar icon={<FontIcon className="fa fa-address-book-o fa-2x" />} />;

    return (
        <div>
            <div style={{display: 'flex', justifyContent:'space-between', alignItems: 'center'}}>
                <div><span>{t('list.title')}</span></div>
                <WalletsTokensButton
                    createAccount={createAccount}
                    t={t}
                />
            </div>
            <div style={{backgroundColor:'red'}}>
                <Card style={{...cardSpace, ...noShadow}}>
                    <CardText expandable={false}>
                        {table}
                    </CardText>
                </Card>
            </div>
        </div>
    );
});

Render.propTypes = {
    accounts: PropTypes.object.isRequired,
    createAccount: PropTypes.func.isRequired,
    connecting: PropTypes.bool.isRequired,
};

const AccountsList = connect(
    (state, ownProps) => ({
        accounts: state.accounts.get('accounts', Immutable.List()),
        connecting: state.launcher.get('connecting')
    }),
    (dispatch, ownProps) => ({
        createAccount: () => {
            dispatch(gotoScreen('create-account'));
        },
    })
)(Render);

export default AccountsList;
