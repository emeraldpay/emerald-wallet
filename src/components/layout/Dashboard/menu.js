import React from 'react';
import PropTypes from 'prop-types';
import { FontIcon, FlatButton, Popover } from 'material-ui';
import { List, ListItem } from 'material-ui/List';
import { Ledger as LedgerIcon } from 'emerald-js-ui/lib/icons';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Add as AddIcon, Download as DownloadIcon, Token1 as TokenIcon } from 'emerald-js-ui/lib/icons2';

const styles = {
  button: {
    color: '#47B04B',
  },
  buttonLabel: {
    paddingRight: 0,
  },
  addIcon: {
    marginBottom: '2px',
  },
};

class DashboardMenu extends React.Component {
  static propTypes = {
    addToken: PropTypes.func,
    generate: PropTypes.func,
    importJson: PropTypes.func,
    importLedger: PropTypes.func,
    importPrivateKey: PropTypes.func,
    importMnemonic: PropTypes.func,
    createMnemonic: PropTypes.func,
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
    const { generate, importJson, importLedger, importPrivateKey, importMnemonic, createMnemonic, muiTheme } = this.props;
    const { t, style } = this.props;
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
              leftIcon={<LedgerIcon color={muiTheme.palette.textColor}/>}
            />
            <ListItem
              primaryText={t('add.generate.title')}
              secondaryText={t('add.generate.subtitle')}
              onClick={ generate }
              leftIcon={<AddIcon color={muiTheme.palette.textColor}/>}
            />
            <ListItem
              primaryText={t('add.mnemonic.title')}
              secondaryText={t('add.mnemonic.subtitle')}
              onClick={ createMnemonic }
              leftIcon={<AddIcon color={muiTheme.palette.textColor}/>}
            />

            <ListItem
              primaryText={t('add.import.title')}
              secondaryText={t('add.import.subtitle')}
              onClick={ importJson }
              leftIcon={<DownloadIcon color={muiTheme.palette.textColor}/>}
            />
            <ListItem
              primaryText={ t('add.importPrivateKey.title') }
              secondaryText={ t('add.importPrivateKey.subtitle') }
              onClick={importPrivateKey}
              leftIcon={<DownloadIcon color={muiTheme.palette.textColor}/>}
            />
            <ListItem
              primaryText={ t('add.importMnemonic.title') }
              secondaryText={ t('add.importMnemonic.subtitle') }
              onClick={ importMnemonic }
              leftIcon={<DownloadIcon color={muiTheme.palette.textColor}/>}
            />
            <ListItem
              primaryText={ t('add.token.title') }
              secondaryText={ t('add.token.subtitle') }
              onClick={ this.handleAddToken }
              leftIcon={<TokenIcon color={muiTheme.palette.textColor}/>}
            />
          </List>
        </Popover>
      </div>
    );
  }
}

export default muiThemeable()(DashboardMenu);
