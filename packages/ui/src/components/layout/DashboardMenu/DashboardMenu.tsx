import {
  AddCircle as AddIcon,
  Book as BookIcon,
  Download as DownloadIcon,
  Key as KeyIcon,
  Keypair as KeypairIcon,
  Ledger as LedgerIcon,
  Token1 as TokenIcon
} from '@emeraldplatform/ui-icons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Popover from '@material-ui/core/Popover';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import Button from '../../common/Button';

const styles = (theme?: any) => ({
  buttonText: {
    paddingRight: 0
  }
});

interface Props {
  addToken?: any;
  generate?: any;
  importJson?: any;
  importLedger?: any;
  importPrivateKey?: any;
  importMnemonic?: any;
  createMnemonic?: any;
  addressBook?: any;
  t?: any;
  style?: any;
  classes?: any;
}

interface State {
  open: boolean;
  anchorEl?: any;
}

class DashboardMenu extends React.Component<Props, State> {
  constructor (props) {
    super(props);
    this.state = {
      open: false
    };
  }

  public openMenu = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget
    });
  }

  public handleRequestClose = () => {
    this.setState({
      open: false
    });
  }

  public handleAddToken = () => {
    this.setState({
      open: false
    });
    if (this.props.addToken) {
      this.props.addToken();
    }
  }

  public render () {
    const {
      generate, importJson, importLedger, importPrivateKey, importMnemonic, createMnemonic, addressBook
    } = this.props;
    const {
      style, classes
    } = this.props;
    const t = this.props.t || ((str: string) => (str));
    return (
      <div style={style}>
        <Button
          variant='text'
          primary={true}
          onClick={this.openMenu}
          classes={{ text: classes.buttonText }}
          style={{ hoverColor: 'transparent' }}
          label={t('accounts.list.popupMenuLabel')}
          icon={<AddIcon/>}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          onClose={this.handleRequestClose}
        >
          <List>
            <ListItem button={true} onClick={importLedger}>
              <ListItemIcon>
                <LedgerIcon />
              </ListItemIcon>
              <ListItemText primary='Ledger Nano S' secondary='Use Ledger hardware key to manage signatures' />
            </ListItem>
            <ListItem button={true} onClick={generate}>
              <ListItemIcon>
                <KeypairIcon />
              </ListItemIcon>
              <ListItemText primary={t('accounts.add.generate.title')} secondary={t('accounts.add.generate.subtitle')} />
            </ListItem>
            <ListItem button={true} onClick={createMnemonic}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary={t('accounts.add.mnemonic.title')} secondary={t('accounts.add.mnemonic.subtitle')} />
            </ListItem>
            <ListItem button={true} onClick={importJson}>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary={t('accounts.add.import.title')} secondary={t('accounts.add.import.subtitle')} />
            </ListItem>
            <ListItem button={true} onClick={importPrivateKey}>
              <ListItemIcon>
                <KeyIcon />
              </ListItemIcon>
              <ListItemText primary={t('accounts.add.importPrivateKey.title')} secondary={t('accounts.add.importPrivateKey.subtitle')} />
            </ListItem>
            <ListItem button={true} onClick={importMnemonic}>
              <ListItemIcon>
                <DownloadIcon />
              </ListItemIcon>
              <ListItemText primary={t('accounts.add.importMnemonic.title')} secondary={t('accounts.add.importMnemonic.subtitle')} />
            </ListItem>
            <ListItem button={true} onClick={addressBook}>
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
              <ListItemText primary='Address Book' secondary='View and edit contacts' />
            </ListItem>
          </List>
        </Popover>
      </div>
    );
  }
}

export default withStyles(styles)(DashboardMenu);
