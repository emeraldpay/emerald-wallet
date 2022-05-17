import { accounts, screen, settings } from '@emeraldwallet/store';
import { Back, Button, Page, PasswordInput } from '@emeraldwallet/ui';
import { createStyles, Grid, Typography, withStyles } from '@material-ui/core';
import * as React from 'react';
import Dropzone from 'react-dropzone';
import { connect } from 'react-redux';
import FormFieldWrapper from '../../../transaction/CreateTx/FormFieldWrapper';
import FormLabel from '../../../transaction/CreateTx/FormLabel/FormLabel';

const styles = createStyles({
  drop: {
    width: '100%',
  },
  dropArea: {
    backgroundColor: '#f0faff',
    border: '1px solid #f0f0f0',
    padding: '40px 0 40px 0',
    textAlign: 'center',
  },
  label: {
    minWidth: 180,
    width: 180,
  },
});

interface DispatchProps {
  goBack(): Promise<void>;
  goHome(): void;
  importVaultFile(file: string, password: string): Promise<boolean>;
  reloadWallets(): void;
  showNotification(message: string, type?: 'success' | 'warning'): void;
}

interface Props extends DispatchProps {
  classes: Record<keyof typeof styles, string>;
}

interface State {
  fileContent?: string;
  fileName?: string;
  password: string;
}

class ImportVault extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { password: '' };
  }

  public handleDropFile = (files: File[]): void => {
    const { showNotification } = this.props;

    const [file] = files;

    if (file != null) {
      const reader = new FileReader();

      reader.onabort = reader.onerror = () => showNotification('An error occurred while opening file', 'warning');

      reader.onload = () => {
        const { result } = reader;

        if (result == null) {
          showNotification('An error occurred while reading file', 'warning');
        } else {
          this.setState({
            fileName: file.name,
            fileContent: result.toString(),
          });
        }
      };

      reader.readAsText(file);
    }
  };

  public handleImportVault = async (): Promise<void> => {
    const { goHome, importVaultFile, reloadWallets, showNotification } = this.props;
    const { password, fileContent } = this.state;

    if (fileContent == null) {
      return;
    }

    let imported = false;

    try {
      imported = await importVaultFile(fileContent, password);
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
    const { fileContent, fileName, password } = this.state;

    return (
      <Page title="Import Vault" leftIcon={<Back onClick={goBack} />}>
        <FormFieldWrapper>
          <FormLabel classes={{ root: classes.label }}>Global password:</FormLabel>
          <PasswordInput onChange={(password) => this.setState({ password: password })} />
        </FormFieldWrapper>
        <FormFieldWrapper>
          <FormLabel classes={{ root: classes.label }} />
          <Dropzone
            accept={{ 'application/emerald-vault': ['.emrldvault'] }}
            multiple={false}
            onDrop={this.handleDropFile}
          >
            {({ getRootProps, getInputProps }) => (
              <section className={classes.drop}>
                <div {...getRootProps()} className={classes.dropArea}>
                  <input {...getInputProps()} />
                  <Typography variant="caption">
                    {fileName == null
                      ? "Drag'n'drop vault file here, or click to select file"
                      : `Selected file "${fileName}"`}
                  </Typography>
                </div>
              </section>
            )}
          </Dropzone>
        </FormFieldWrapper>
        <FormFieldWrapper>
          <FormLabel classes={{ root: classes.label }} />
          <Grid container justify="flex-end">
            <Grid item>
              <Button
                disabled={fileContent == null || password?.length === 0}
                label="Import"
                primary={true}
                onClick={this.handleImportVault}
              />
            </Grid>
          </Grid>
        </FormFieldWrapper>
      </Page>
    );
  }
}

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    goBack() {
      return dispatch(screen.actions.goBack());
    },
    goHome: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    },
    importVaultFile(file, password) {
      return dispatch(settings.actions.importVaultFile(file, password));
    },
    reloadWallets() {
      dispatch(accounts.actions.loadWalletsAction());
    },
    showNotification(message, type = 'success') {
      dispatch(screen.actions.showNotification(message, type, 3000, null, null));
    },
  }),
)(withStyles(styles)(ImportVault));
