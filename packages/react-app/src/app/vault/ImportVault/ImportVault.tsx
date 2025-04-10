import { basename } from 'path';
import { dialog, getCurrentWindow } from '@electron/remote';
import { accounts, screen, settings } from '@emeraldwallet/store';
import { Back, Button, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { Grid, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';
import { connect } from 'react-redux';
import { VAULT_FILE_FILTER } from '../../../settings/Settings/types';

const useStyles = makeStyles()({
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

const ImportVault: React.FC<DispatchProps> = ({ 
  goBack, 
  goHome, 
  importVaultFile, 
  reloadWallets, 
  showNotification 
}) => {
  const { classes } = useStyles();
  const [password, setPassword] = React.useState('');
  const [fileName, setFileName] = React.useState<string | undefined>();
  const [filePath, setFilePath] = React.useState<string | undefined>();
  const dragAndDrop = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const current = dragAndDrop.current;
    if (current) {
      current.ondragover = () => false;
      current.ondragleave = () => false;
      current.ondragend = () => false;

      current.ondrop = (event: DragEvent) => {
        const file = event.dataTransfer?.files[0];

        if (file == null) {
          return false;
        }

        const extensionValid = VAULT_FILE_FILTER.extensions.reduce((carry, extension) => {
          const extRegExp = new RegExp(`\\.${extension}$`, 'gi');
          return carry || extRegExp.test(file.name);
        }, false);

        if (extensionValid) {
          setFileName(file.name);
          setFilePath(file.path);
        }

        return false;
      };
    }
  }, []);

  const handleSelectFile = async (): Promise<void> => {
    const { filePaths } = await dialog.showOpenDialog(getCurrentWindow(), { filters: [VAULT_FILE_FILTER] });
    const [selectedFilePath] = filePaths;

    if (selectedFilePath == null) {
      return;
    }

    setFilePath(selectedFilePath);
    setFileName(basename(selectedFilePath));
  };

  const handleImportVault = async (): Promise<void> => {
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

  return (
    <Page title="Import Vault" leftIcon={<Back onClick={goBack} />}>
      <FormRow>
        <FormLabel classes={{ root: classes.label }}>Global password:</FormLabel>
        <PasswordInput onChange={setPassword} />
      </FormRow>
      <FormRow>
        <FormLabel classes={{ root: classes.label }} />
        <div className={classes.drop} ref={dragAndDrop} onClick={handleSelectFile}>
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
              onClick={handleImportVault}
            />
          </Grid>
        </Grid>
      </FormRow>
    </Page>
  );
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
      dispatch(screen.actions.showNotification(message, type));
    },
  }),
)(ImportVault);
