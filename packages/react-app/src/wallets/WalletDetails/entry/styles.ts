import { StyleRules, Theme, createStyles } from '@material-ui/core';
import { grey as greyColor } from '@material-ui/core/colors';

type ClassKeys =
  | 'button'
  | 'buttonDisabled'
  | 'entry'
  | 'entryIcon'
  | 'entryBalance'
  | 'entryBalanceValue'
  | 'entryActions';

export default (theme: Theme): StyleRules<ClassKeys> =>
  createStyles({
    button: {
      color: `${greyColor[500]} !important`,
    },
    buttonDisabled: {
      color: `${greyColor[300]} !important`,
    },
    entry: {
      display: 'grid',
      gridTemplateColumns: '40px 2fr 4fr 1fr',
      columnGap: theme.spacing(2),
      marginLeft: theme.spacing(8),
    },
    entryIcon: {
      display: 'flex',
      alignItems: 'center',
    },
    entryBalance: {
      columnGap: theme.spacing(),
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
    },
    entryBalanceValue: {
      justifySelf: 'end',
    },
    entryActions: {
      alignItems: 'start',
      display: 'flex',
      justifyContent: 'end',
    },
  });
