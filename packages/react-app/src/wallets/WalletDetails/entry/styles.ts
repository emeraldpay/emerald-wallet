import {EmeraldTheme} from "@emeraldwallet/ui";
import {CSSObject} from "tss-react";

type ClassKeys =
  | 'button'
  | 'buttonDisabled'
  | 'entry'
  | 'entryIcon'
  | 'entryBalance'
  | 'entryBalanceValue'
  | 'entryActions';

const entryStyles: Record<ClassKeys, CSSObject> =
  {
    button: {
      color: `${EmeraldTheme.palette.grey["500"]} !important`,
    },
    buttonDisabled: {
      color: `${EmeraldTheme.palette.grey["300"]} !important`,
    },
    entry: {
      display: 'grid',
      gridTemplateColumns: '40px 2fr 4fr 1fr',
      columnGap: EmeraldTheme.spacing(2),
      marginLeft: EmeraldTheme.spacing(8),
    },
    entryIcon: {
      display: 'flex',
      alignItems: 'center',
    },
    entryBalance: {
      columnGap: EmeraldTheme.spacing(),
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
  };

export default entryStyles;
