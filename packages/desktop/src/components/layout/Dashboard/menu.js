import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Popover } from 'material-ui';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import {
  Ledger as LedgerIcon,
  Key as KeyIcon,
  Keypair as KeypairIcon,
  AddCircle as AddIcon,
  Download as DownloadIcon,
  Token1 as TokenIcon,
  Book as BookIcon,
} from '@emeraldplatform/ui-icons';
import muiThemeable from 'material-ui/styles/muiThemeable';
import { Button } from 'ui';

const styles2 = {
  buttonText: {
    paddingRight: 0,
  },
};

const MenuButton = ({ label, onClick, classes }) => {
  return (
    <Button
      variant="text"
      primary
      onClick={onClick}
      classes={{ text: classes.buttonText }}
      hoverColor="transparent"
      label={label}
      icon={<AddIcon/>} />
  );
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
    const {
      generate, importJson, importLedger, importPrivateKey, importMnemonic, createMnemonic, addressBook,
    } = this.props;
    const {
      t, style, muiTheme, classes,
    } = this.props;
    return (
      <div style={ style }>
        <MenuButton label={ t('list.popupMenuLabel')} onClick={this.openMenu} classes={classes} />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'left', vertical: 'top'}}
          onRequestClose={this.handleRequestClose}
        >
          <List style={{border: `1px solid ${muiTheme.palette.borderColor}`}}>
            <ListItem button onClick={importLedger}>
              <ListItemIcon>
                <LedgerIcon />
              </ListItemIcon>
              <ListItemText primary="Ledger Nano S" secondary="Use Ledger hardware key to manage signatures" />
            </ListItem>
            <ListItem button onClick={ generate }>
              <ListItemIcon>
                <KeypairIcon />
              </ListItemIcon>
              <ListItemText primary={t('add.generate.title')} secondary={t('add.generate.subtitle')} />
            </ListItem>
            <ListItem button onClick={ createMnemonic }>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t('add.mnemonic.title')} secondary={t('add.mnemonic.subtitle')} />
            </ListItem>
            <ListItem button onClick={ importJson }>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary={t('add.import.title')} secondary={t('add.import.subtitle')} />
            </ListItem>
            <ListItem button onClick={importPrivateKey}>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary={ t('add.importPrivateKey.title') } secondary={ t('add.importPrivateKey.subtitle') } />
            </ListItem>
            <ListItem button onClick={ importMnemonic }>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary={ t('add.importMnemonic.title') } secondary={ t('add.importMnemonic.subtitle') } />
            </ListItem>
            <ListItem button onClick={ this.handleAddToken }>
              <ListItemIcon>
                <TokenIcon />
              </ListItemIcon>
              <ListItemText primary={ t('add.token.title') } secondary={ t('add.token.subtitle') } />
            </ListItem>
            <ListItem button onClick={ addressBook }>
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
              <ListItemText primary="Address Book" secondary="View and edit contacts" />
            </ListItem>
          </List>
        </Popover>
      </div>
    );
  }
}

export default withStyles(styles2)(muiThemeable()(DashboardMenu));
