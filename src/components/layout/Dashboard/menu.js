import React from 'react';
import { FontIcon, FlatButton, Popover } from 'material-ui';
import { List, ListItem } from 'material-ui/List';

class DashboardMenu extends React.Component {

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
    }

    handleRequestClose = () => {
        this.setState({
            open: false,
        });
    }

    render() {
        const { generate, importJson, importLedger, importPrivateKey, addToken, t, style } = this.props;

        return (
            <div style={ style }>
                <FlatButton
                    onTouchTap={ this.handleTouchTap }
                    label={ t('list.popupMenuLabel') }
                    labelStyle={{ paddingRight: 0 }}
                    style={{ color: '#47B04B' }}
                    hoverColor="transparent"
                    icon={<FontIcon className="fa fa-plus-circle"/>}
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
                            onClick={ generate }
                            leftIcon={<FontIcon className="fa fa-random"/>}
                        />
                        <ListItem
                            primaryText={t('add.import.title')}
                            secondaryText={t('add.import.subtitle')}
                            onClick={ importJson }
                            leftIcon={<FontIcon className="fa fa-code"/>}
                        />
                        <ListItem
                            primaryText={ t('add.importPrivateKey.title') }
                            secondaryText={ t('add.importPrivateKey.subtitle') }
                            onClick={importPrivateKey}
                            leftIcon={<FontIcon className="fa fa-key"/>}
                        />
                        <ListItem
                            primaryText={ t('add.token.title') }
                            secondaryText={ t('add.token.subtitle') }
                            onClick={ addToken }
                            leftIcon={<FontIcon className="fa fa-key"/>}
                        />
                    </List>
                </Popover>
            </div>
        );
    }
}

export default DashboardMenu;
