import React from 'react';
import PropTypes from 'prop-types';
import { FontIcon, FlatButton, Popover } from 'material-ui';
import { List, ListItem } from 'material-ui/List';
import { Add as AddIcon } from 'emerald-js/lib/ui/icons';

const styles = {
    button: {
        color: '#47B04B',
    },
    buttonLabel: {
        paddingRight: 0,
    },
    addIcon: {
        width: '21px',
        height: '21px',
    },
};

class DashboardMenu extends React.Component {

    static propTypes = {
        addToken: PropTypes.func,
        generate: PropTypes.func,
        importJson: PropTypes.func,
        importLedger: PropTypes.func,
        importPrivateKey: PropTypes.func,
        t: PropTypes.func.isRequired,
        style: PropTypes.object,
    }

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

    handleAddToken = () => {
        this.setState({
            open: false,
        });
        if (this.props.addToken) {
            this.props.addToken();
        }
    }

    render() {
        const { generate, importJson, importLedger, importPrivateKey, t, style } = this.props;

        return (
            <div style={ style }>
                <FlatButton
                    onTouchTap={ this.handleTouchTap }
                    label={ t('list.popupMenuLabel') }
                    labelStyle={ styles.buttonLabel }
                    style={ styles.button }
                    hoverColor="transparent"
                    icon={<AddIcon style={ styles.addIcon } />}
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
                            onClick={ this.handleAddToken }
                            leftIcon={<FontIcon className="fa fa-money"/>}
                        />
                    </List>
                </Popover>
            </div>
        );
    }
}

export default DashboardMenu;
