import { Box, Button, Chip, Grid, Typography } from '@mui/material';
import { Alert } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
import * as React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { ButtonGroup } from '../../common/ButtonGroup';
import ConfirmedPasswordInput from '../../common/PasswordConfirmedInput';
import { makeStyles } from 'tss-react/mui';

const CANVAS_COLUMNS = 6 as const;
const CANVAS_FONT_SIZE = 18 as const;
const CANVAS_LINE_HEIGHT = 20 as const;
const CANVAS_PADDING_LEFT = 20 as const;
const CANVAS_PADDING_TOP = 20 as const;

const useStyles = makeStyles()({
    alertButton: {
      whiteSpace: 'nowrap',
    },
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    mnemonicGrid: {
      boxSizing: 'border-box',
      display: 'grid',
      gap: '10px',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gridTemplateRows: 'repeat(4, 1fr)',
      marginBottom: '15px',
      minHeight: '170px',
      padding: '5px',
      width: '100%',
    },
    mnemonicGridBorder: {
      border: '1px solid #f0f0f0',
    },
    mnemonicDraggableDrag: {
      opacity: '1 !important',
    },
    mnemonicDraggableGhost: {
      opacity: 0,
    },
    mnemonicPart: {
      justifyContent: 'space-between',
    },
    mnemonicPartLabel: {
      flex: '1 0 auto',
      textAlign: 'center',
    },
    mnemonicPreview: {
      backgroundColor: '#f0faff',
      border: '1px solid #f0f0f0',
    },
    mnemonicPreviewCanvas: {
      display: 'block',
    },
  }
);

// Component properties
interface OwnProps {
  onGenerate?(): Promise<string>;
  onContinue?(value: string, password: string | undefined): void;
}

interface MnemonicRandomPartType {
  id: number;
  name: string;
}

interface MnemonicSelectedPartType extends MnemonicRandomPartType {
  chosen?: boolean;
}

const NewMnemonic: React.FC<OwnProps> = ({ onContinue, onGenerate }) => {
  const styles = useStyles().classes;

  const mnemonicPreview = React.useRef<HTMLCanvasElement | undefined>();

  const [mnemonic, setMnemonic] = React.useState('');

  const [password, setPassword] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');

  const [confirming, setConfirming] = React.useState(false);
  const [expectPassword, setExpectPassword] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const hasMnemonic = typeof mnemonic === 'string' && mnemonic.length > 0;
  const confirmed = hasMnemonic && confirmation.toLowerCase().replace(/\s+/g, ' ').trim() === mnemonic.toLowerCase();

  let passwordField: React.ReactNode;

  if (expectPassword) {
    if (password && password.length > 0) {
      passwordField = (
        <Alert
          action={
            <Button
              className={styles.alertButton}
              color="inherit"
              disabled={done}
              variant="outlined"
              onClick={() => {
                setPassword('');
                setExpectPassword(false);
              }}
            >
              Reset
            </Button>
          }
          severity="success"
        >
          Phrase protection password is set.
        </Alert>
      );
    } else {
      passwordField = (
        <ConfirmedPasswordInput
          buttonLabel="Set password"
          disabled={done}
          helperText="(optional) Additional password to protect the seed phrase."
          minLength={1}
          onChange={setPassword}
        />
      );
    }
  } else {
    passwordField = (
      <Alert
        action={
          <Button
            className={styles.alertButton}
            color="inherit"
            disabled={done}
            variant="outlined"
            onClick={() => setExpectPassword(true)}
          >
            Set Passphrase
          </Button>
        }
        severity="info"
      >
        You may set an additional password to your seed phrase.
      </Alert>
    );
  }

  let content: React.ReactNode;
  let title: string;

  const [mnemonicRandomParts, setMnemonicRandomParts] = React.useState<MnemonicRandomPartType[]>([]);
  const [mnemonicSelectedParts, setMnemonicSelectedParts] = React.useState<MnemonicSelectedPartType[]>([]);

  let theme = useTheme();

  React.useEffect(() => {
    const mnemonicParts = mnemonic.split(' ');

    let mnemonicRandomParts: MnemonicRandomPartType[] = [];

    if (confirming) {
      mnemonicRandomParts = mnemonicParts
        .map((part) => ({ sort: Math.random(), part }))
        .sort((first, second) => first.sort - second.sort)
        .map(({ part }, index) => ({ id: index, name: part }));

      setMnemonicSelectedParts([]);
    }

    setMnemonicRandomParts(mnemonicRandomParts);

    if (mnemonicPreview.current != null) {
      const { current: element } = mnemonicPreview;

      element.height = Math.ceil(mnemonicParts.length / CANVAS_COLUMNS) * CANVAS_LINE_HEIGHT + CANVAS_PADDING_TOP * 2;
      element.width = element.parentElement.clientWidth;

      const context = element.getContext('2d');

      context.font = `${CANVAS_FONT_SIZE}px/${CANVAS_LINE_HEIGHT}px ${theme.monotype.fontFamily}`;
      context.textBaseline = 'bottom';

      const columnWidth = Math.ceil((element.parentElement.clientWidth - CANVAS_PADDING_LEFT * 2) / CANVAS_COLUMNS);

      let columnCounter = 0;
      let columnPartIndex = 0;

      mnemonicParts.forEach((part, index) => {
        const partCount = index + 1;

        if (columnCounter >= CANVAS_COLUMNS) {
          columnCounter = 0;
          columnPartIndex += 1;
        }

        const x = CANVAS_PADDING_LEFT + columnWidth * columnCounter;
        const y = CANVAS_PADDING_TOP + CANVAS_LINE_HEIGHT * (columnPartIndex + 1);

        columnCounter += 1;

        context.fillText(`${partCount < 10 ? ` ${partCount}` : partCount}. ${part}`, x, y, columnWidth);
      });
    }
  }, [confirming, mnemonic]);

  React.useEffect(() => {
    setConfirmation(mnemonicSelectedParts.map((selected) => selected.name).join(' '));
  }, [mnemonicSelectedParts]);

  if (confirming) {
    title = 'Confirm generated phrase';

    content = (
      <Grid container>
        <Grid item xs={12}>
          <ReactSortable
            forceFallback
            className={`${styles.mnemonicGrid} ${styles.mnemonicGridBorder}`}
            dragClass={styles.mnemonicDraggableDrag}
            ghostClass={styles.mnemonicDraggableGhost}
            list={mnemonicSelectedParts}
            setList={setMnemonicSelectedParts}
          >
            {mnemonicSelectedParts.map((selected) => (
              <Chip
                key={`mnemonic-selected-${selected.name}[${selected.id}]`}
                classes={{ root: styles.mnemonicPart, label: styles.mnemonicPartLabel }}
                color={selected.chosen ? 'primary' : 'default'}
                label={selected.name}
                onDelete={() =>
                  setMnemonicSelectedParts(mnemonicSelectedParts.filter((item) => item.name !== selected.name))
                }
              />
            ))}
          </ReactSortable>
        </Grid>
        <Grid item xs={12}>
          <div className={styles.mnemonicGrid}>
            {mnemonicRandomParts.map((part) =>
              mnemonicSelectedParts.find((item) => part.id === item.id) == null ? (
                <Chip
                  key={`mnemonic-random[${part.id}]`}
                  classes={{ root: styles.mnemonicPart, label: styles.mnemonicPartLabel }}
                  label={part.name}
                  onClick={() => setMnemonicSelectedParts([...mnemonicSelectedParts, part])}
                />
              ) : (
                <div key={`mnemonic-random[${part.id}]`}>&nbsp;</div>
              ),
            )}
          </div>
        </Grid>
        <Grid item xs={10}>
          {passwordField}
        </Grid>
        <Grid item xs={2}>
          <ButtonGroup classes={{ container: styles.buttons }}>
            <Button
              color="secondary"
              disabled={done}
              variant="contained"
              onClick={() => {
                setConfirming(false);

                setPassword('');
                setExpectPassword(false);
              }}
            >
              Back
            </Button>
            <Button
              disabled={!confirmed || done}
              color="primary"
              variant="contained"
              onClick={() => {
                onContinue(mnemonic, password.length > 0 ? password : undefined);

                setDone(true);
              }}
            >
              Confirm
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  } else {
    title = 'Generated Seed Phrase';

    if (hasMnemonic) {
      content = (
        <>
          <Box mb={2}>
            <div className={styles.mnemonicPreview}>
              <canvas className={styles.mnemonicPreviewCanvas} ref={mnemonicPreview} />
            </div>
          </Box>
          <Box display="flex" justifyContent="end" mb={2}>
            <Button
              color="primary"
              variant="contained"
              onClick={() => onGenerate().then(setMnemonic).catch(console.error)}
            >
              Generate New
            </Button>
          </Box>
          <Box>
            <Alert
              action={
                <Button
                  className={styles.alertButton}
                  color="inherit"
                  disabled={done}
                  size="small"
                  variant="outlined"
                  onClick={() => setConfirming(true)}
                >
                  Yes, I wrote it down
                </Button>
              }
              severity="warning"
            >
              Write down your 24-word seed phrase and store it safely.
              This phrase is the only way to access your funds, and it must never be shared or entered online.
              If you lose this seed phrase, you cannot recover your wallet.
              Keep it secret, keep it safe.
            </Alert>
          </Box>
        </>
      );
    } else {
      content = (
        <>
          <Box mb={2}>
            <Alert severity="info">
              Click &quot;Generate Seed&quot; to create a new seed phrase that will be a key to spend your
              cryptocurrencies.
            </Alert>
          </Box>
          <Box display="flex" justifyContent="end">
            <Button
              color="primary"
              variant="contained"
              onClick={() => onGenerate().then(setMnemonic).catch(console.error)}
            >
              Generate Seed
            </Button>
          </Box>
        </>
      );
    }
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box mb={2}>
          <Typography variant="h6">{title}</Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        {content}
      </Grid>
    </Grid>
  );
};

export default NewMnemonic;
