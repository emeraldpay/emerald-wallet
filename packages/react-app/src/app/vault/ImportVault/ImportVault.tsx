import { basename } from 'path';
import { dialog, getCurrentWindow } from '@electron/remote';
import { accounts, screen, settings } from '@emeraldwallet/store';
import { Back, Button, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { Grid, Typography, createStyles, withStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import { VAULT_FILE_FILTER } from '../../../settings/Settings/types';

const styles = createStyles({
  drop: {
    backgroundColor: '#f0faff',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
    padding: '40px 0 40px 0',
    textAlign: 'center',
    width: '100%',
  },
  label: {
    minWidth: 180,
    width: 180,
  },
});

interface DispatchProps {
  goBack(): Promise<void>;
  goHome(): void;
  importVaultFile(path: string, password: string): Promise<boolean>;
  reloadWallets(): void;
  showNotification(message: string, type?: 'success' | 'warning'): void;
}

interface Props extends DispatchProps {
  classes: Record<keyof typeof styles, string>;
}

interface State {
  fileName?: string;
  filePath?: string;
  password: string;
}

class ImportVault extends React.Component<Props, State> {
  private readonly dragAndDrop: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);

    this.state = { password: '' };

    this.dragAndDrop = React.createRef();
  }

  componentDidMount(): void {
    const { current: dragAndDrop } = this.dragAndDrop;

    if (dragAndDrop != null) {
      dragAndDrop.ondragover = () => false;
      dragAndDrop.ondragleave = () => false;
      dragAndDrop.ondragend = () => false;

      dragAndDrop.ondrop = (event: DragEvent) => {
        const file = event.dataTransfer?.files[0];

        if (file == null) {
          return false;
        }

        const extensionValid = VAULT_FILE_FILTER.extensions.reduce((carry, extension) => {
          const extRegExp = new RegExp(`\\.${extension}$`, 'gi');

          return carry || extRegExp.test(file.name);
        }, false);

        if (extensionValid) {
          this.setState({
            fileName: file.name,
            filePath: file.path,
          });
        }

        return false;
      };
    }
  }

  public handleSelectFile = async (): Promise<void> => {
    const { filePaths } = await dialog.showOpenDialog(getCurrentWindow(), { filters: [VAULT_FILE_FILTER] });

    const [filePath] = filePaths;

    if (filePath == null) {
      return;
    }

    this.setState({ filePath, fileName: basename(filePath) });
  };

  public handleImportVault = async (): Promise<void> => {
    const { goHome, importVaultFile, reloadWallets, showNotification } = this.props;
    const { password, filePath } = this.state;

    if (filePath == null) {
      return;
    }

    let imported = false;

    try {
      imported = await importVaultFile(filePath, password);
    } catch (exception) {
      showNotification('An error occurred while importing', 'warning');

      return;
    }

    if (imported) {
      showNotification('Import successful');

      reloadWallets();
      goHome();
    } else {
      showNotification('Import failed', 'warning');
    }
  };

  render(): React.ReactNode {
    const { classes, goBack } = this.props;
    const { fileName, password } = this.state;

    return (
      <Page title="Import Vault" leftIcon={<Back onClick={goBack} />}>
        <FormRow>
          <FormLabel classes={{ root: classes.label }}>Global password:</FormLabel>
          <PasswordInput onChange={(password) => this.setState({ password: password })} />
        </FormRow>
        <FormRow>
          <FormLabel classes={{ root: classes.label }} />
          <div className={classes.drop} ref={this.dragAndDrop} onClick={this.handleSelectFile}>
            <Typography variant="caption">
              {fileName == null
                ? "Drag'n'drop vault file here, or click to select file"
                : `Selected file "${fileName}"`}
            </Typography>
          </div>
        </FormRow>
        <FormRow>
          <FormLabel classes={{ root: classes.label }} />
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button
                disabled={fileName == null || password?.length === 0}
                label="Import"
                primary={true}
                onClick={this.handleImportVault}
              />
            </Grid>
          </Grid>
        </FormRow>
      </Page>
    );
  }
}

export default connect<unknown, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    goBack() {
      return dispatch(screen.actions.goBack());
    },
    goHome: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    },
    importVaultFile(path, password) {
      return dispatch(settings.actions.importVaultFile(path, password));
    },
    reloadWallets() {
      dispatch(accounts.actions.loadWalletsAction());
    },
    showNotification(message, type = 'success') {
      dispatch(screen.actions.showNotification(message, type, 3000, null, null));
    },
  }),
)(withStyles(styles)(ImportVault));
