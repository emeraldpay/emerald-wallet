import React from 'react';
import PropTypes from 'prop-types';
import { FlatButton, Popover } from 'material-ui';
import { List, ListItem } from 'material-ui/List';
import {
  Ledger as LedgerIcon,
  Key as KeyIcon,
  Keypair as KeypairIcon,
  AddCircle as AddIcon,
  Download as DownloadIcon,
  Token1 as TokenIcon,
  Book as BookIcon,
} from 'emerald-js-ui/lib/icons3';
import muiThemeable from 'material-ui/styles/muiThemeable';

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

  openMenu = (event) => {
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
    const { generate, importJson, importLedger, importPrivateKey, importMnemonic, createMnemonic, addressBook } = this.props;
    const { t, style, muiTheme } = this.props;
    return (
      <div style={ style }>
        <FlatButton
          onClick={ this.openMenu }
          label={ t('list.popupMenuLabel') }
          labelStyle={ styles.buttonLabel }
          style={{color: muiTheme.palette.primary1Color}}
          hoverColor="transparent"
          icon={<AddIcon style={{color: muiTheme.palette.secondaryTextColor, ...styles.addIcon}} />}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <List style={{border: `1px solid ${muiTheme.palette.borderColor}`}}>
            <ListItem
              primaryText="Ledger Nano S"
              secondaryText="Use Ledger hardware key to manage signatures"
              onClick={importLedger}
              leftIcon={<LedgerIcon />}
            />
            <ListItem
              primaryText={t('add.generate.title')}
              secondaryText={t('add.generate.subtitle')}
              onClick={ generate }
              leftIcon={<KeypairIcon />}
            />
            <ListItem
              primaryText={t('add.mnemonic.title')}
              secondaryText={t('add.mnemonic.subtitle')}
              onClick={ createMnemonic }
              leftIcon={<AddIcon />}
            />

            <ListItem
              primaryText={t('add.import.title')}
              secondaryText={t('add.import.subtitle')}
              onClick={ importJson }
              leftIcon={<DownloadIcon />}
            />
            <ListItem
              primaryText={ t('add.importPrivateKey.title') }
              secondaryText={ t('add.importPrivateKey.subtitle') }
              onClick={importPrivateKey}
              leftIcon={<KeyIcon />}
            />
            <ListItem
              primaryText={ t('add.importMnemonic.title') }
              secondaryText={ t('add.importMnemonic.subtitle') }
              onClick={ importMnemonic }
              leftIcon={<DownloadIcon />}
            />
            <ListItem
              primaryText={ t('add.token.title') }
              secondaryText={ t('add.token.subtitle') }
              onClick={ this.handleAddToken }
              leftIcon={<TokenIcon />}
            />
            <ListItem
              primaryText="Address Book"
              secondaryText="View and edit contacts"
              onClick={ addressBook }
              leftIcon={<BookIcon />}
            />
          </List>
        </Popover>
      </div>
    );
  }
}

export default muiThemeable()(DashboardMenu);
