import { IdSeedReference, SeedDescription, SeedDetails, SeedType, Uuid } from '@emeraldpay/emerald-vault-core';
import { parseDate } from '@emeraldwallet/core/lib/utils';
import { Pen3 as EditIcon, Ledger } from '@emeraldwallet/ui';
import {
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import SecretPhraseIcon from '@material-ui/icons/FileCopy';
import InfoIcon from '@material-ui/icons/Info';
import * as React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      '& + &': {
        marginTop: theme.spacing(2),
      },
    },
    button: {
      fontSize: 16,
      padding: 4,
    },
    header: {
      marginBottom: theme.spacing(),
    },
    seed: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'space-between',
    },
    seedId: {
      alignItems: 'center',
      display: 'flex',
    },
    seedIdText: {
      marginRight: theme.spacing(),
      ...theme.monotype,
    },
    seedLabel: {
      alignItems: 'center',
      display: 'flex',
    },
    seedLabelText: {
      lineHeight: '32px',
      marginRight: theme.spacing(),
    },
    seedSince: {
      minWidth: 220,
    },
    seedType: {
      alignItems: 'center',
      display: 'flex',
      minWidth: 160,
    },
    seedTypeIcon: {
      marginRight: theme.spacing(),
    },
    textField: {
      height: 32,
      padding: '0 8px',
      width: '100%',
    },
    textFieldInput: {
      fontSize: 16,
      height: 'auto',
      lineHeight: '32px',
      padding: '1px 0',
    },
    textFieldRoot: {
      minHeight: 0,
    },
  }),
);

interface OwnProps {
  seed: SeedDescription;
  updateSeed(seed: Uuid | IdSeedReference, details: Partial<SeedDetails>): Promise<boolean>;
}

function seedTypeName(type: SeedType): string {
  switch (type) {
    case 'ledger':
      return 'Ledger';
    case 'mnemonic':
    case 'raw':
      return 'Secret Phrase';
    default:
      return 'Unknown type';
  }
}

function seedTypeIcon(type: SeedType): React.ReactElement {
  switch (type) {
    case 'ledger':
      return <Ledger color="secondary" fontSize="small" />;
    case 'mnemonic':
    case 'raw':
      return <SecretPhraseIcon color="secondary" fontSize="small" />;
    default:
      return <></>;
  }
}

const SeedItem: React.FC<OwnProps> = ({ seed, updateSeed }) => {
  const styles = useStyles();

  const [label, setLabel] = React.useState(seed.label ?? seed.id);
  const [edit, setEdit] = React.useState(false);

  const onSeedUpdate = React.useCallback(() => {
    if (seed.id != null) {
      updateSeed(seed.id, { label }).then(() => setEdit(false));
    } else {
      setEdit(false);
    }
  }, [label, seed, updateSeed]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        {edit ? (
          <TextField
            InputProps={{
              classes: {
                input: styles.textFieldInput,
                root: styles.textFieldRoot,
              },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton className={styles.button} onClick={onSeedUpdate}>
                    <CheckIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton className={styles.button} onClick={() => setEdit(false)}>
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            classes={{ root: styles.textField }}
            size="small"
            value={label}
            onChange={({ target: { value } }) => setLabel(value)}
          />
        ) : (
          <div className={styles.seedLabel}>
            <Typography className={styles.seedLabelText} variant="subtitle1">
              {label}
            </Typography>
            <IconButton className={styles.button} onClick={() => setEdit(true)}>
              <EditIcon fontSize="inherit" />
            </IconButton>
          </div>
        )}
      </div>
      <div className={styles.seed}>
        <div className={styles.seedType}>
          <div className={styles.seedTypeIcon}>{seedTypeIcon(seed.type)}</div>
          <Typography variant="body2">{seedTypeName(seed.type)}</Typography>
        </div>
        <div className={styles.seedSince}>Since {parseDate(seed.createdAt)?.toLocaleString()}</div>
        <div className={styles.seedId}>
          <Typography className={styles.seedIdText} variant="body2">
            {seed.id}
          </Typography>
          <Tooltip title="Internal identifier of the Seed used by Emerald Vault">
            <InfoIcon color="secondary" fontSize="small" />
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default SeedItem;
