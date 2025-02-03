/*
Copyright 2025 EmeraldPay
Copyright 2020 EmeraldPay, Inc
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { createTheme } from '@material-ui/core';
import createSpacing from '@material-ui/core/styles/createSpacing';
import * as React from 'react';
import colors from './colors';
import '@fontsource/inter';
import '@fontsource/roboto-mono';

const spacing = 10;

declare module '@material-ui/core/styles/createTheme' {
  interface Theme {
    monotype: {
      fontFamily: React.CSSProperties['fontFamily'];
      fontWeight: React.CSSProperties['fontWeight'];
    };
  }

  interface ThemeOptions {
    monotype?: {
      fontFamily?: React.CSSProperties['fontFamily'];
      fontWeight?: React.CSSProperties['fontWeight'];
    };
  }
}

export default createTheme({
  monotype: {
    fontFamily: ['"Roboto Mono"', 'monospace'].join(','),
    fontWeight: 500,
  },
  overrides: {
    MuiAppBar: {
      colorDefault: {
        backgroundColor: colors.white.main,
      },
      root: {
        boxShadow: 'none',
      },
    },
    MuiCardActions: {
      root: {
        float: 'right' as const,
        paddingBottom: '16px',
        paddingRight: '16px',
      },
    },
    MuiCardHeader: {
      action: {
        marginRight: '0',
        width: '100%', //TODO why???
      },
    },
    MuiButton: {
      contained: {
        backgroundColor: colors.emerald.main,
        boxShadow: 'none',
        color: colors.white.main,
      },
      root: {
        borderRadius: 0,
        color: colors.emerald.main,
        minHeight: spacing * 4,
        textTransform: 'none',
      },
    },
    MuiFormControl: {
      root: {
        boxSizing: 'border-box',
        paddingLeft: spacing,
        paddingRight: spacing,
      },
    },
    MuiFormHelperText: {
      root: {
        bottom: -16,
        fontSize: '0.8rem',
        lineHeight: 1,
        marginTop: 0,
        position: 'absolute',
      },
    },
    MuiInput: {
      root: {
        minHeight: spacing * 5,
      },
    },
    MuiInputAdornment: {
      root: {
        maxHeight: 'none',
      },
    },
    MuiList: {
      root: {
        borderTop: `1px solid ${colors.grey100.main}`,
      },
      padding: {
        paddingBottom: 0,
        paddingTop: 0,
      },
    },
    MuiListItem: {
      root: {
        borderBottom: `1px solid ${colors.grey100.main}`,
        borderRight: 'none',
        borderLeft: 'none',
      },
    },
    MuiMenuItem: {
      root: {
        border: 'none',
        cursor: 'pointer',
        height: 'auto',
        lineHeight: `${spacing * 2}px`,
        marginLeft: spacing / 2,
        padding: `${spacing / 2}px ${spacing * 8}px ${spacing / 2}px ${spacing * 4}px`,
        '&$selected': {
          marginLeft: '0',
          borderLeft: `${spacing / 2}px solid ${colors.emerald.main}`,
        },
      },
    },
    MuiPaper: {
      root: {
        border: `1px solid ${colors.grey100.main}`,
      },
      elevation3: {
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
      },
    },
    MuiStepLabel: {
      label: {
        fontSize: '0.8em',
      },
    },
    MuiTextField: {
      root: {
        borderColor: colors.grey100.main,
        borderRadius: '1px',
        borderStyle: 'solid',
        borderWidth: '1px',
      },
    },
    MuiTableCell: {
      head: {
        fontWeight: 600,
      },
    },
    MuiTableRow: {
      root: {
        '&:last-child td': {
          borderBottom: 0,
        },
      },
    },
    MuiToolbar: {
      gutters: {
        paddingLeft: spacing * 3,
        paddingRight: spacing * 3,
      },
    },
    MuiTypography: {
      gutterBottom: {
        marginBottom: spacing * 4,
      },
      paragraph: {
        marginBottom: spacing * 2,
      },
    },
  },
  palette: {
    action: {
      hover: 'none',
      selected: colors.grey50.main,
    },
    background: {
      default: colors.grey50.main,
    },
    divider: colors.grey100.main,
    error: {
      main: colors.red.main,
    },
    primary: colors.emerald,
    secondary: colors.grey200,
    text: {
      primary: colors.grey900.main,
      secondary: colors.grey200.main,
    },
  },
  props: {
    MuiInput: {
      disableUnderline: true,
    },
    MuiList: {
      disablePadding: true,
    },
    MuiPaper: {
      elevation: 0,
      square: true,
    },
    MuiTypography: {
      color: 'secondary',
    },
  },
  spacing: createSpacing(spacing),
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightMedium: 400,
    fontWeightRegular: 400,
  },
});
