import { createMuiTheme } from '@material-ui/core/styles';
import theme from 'emerald-js-ui/src/theme.json';

const defaultTheme = createMuiTheme({
  palette: {
    primary: {
      main: theme.palette.primary1Color,
      contrastText: theme.palette.alternateTextColor,
    },
    secondary: {
      main: theme.palette.accent3Color,
      contrastText: theme.palette.alternateTextColor,
    },
    text: {
      primary: theme.palette.textColor,
    },
    background: {
      default: theme.palette.canvasColor,
    },
  },
});

export default defaultTheme;
