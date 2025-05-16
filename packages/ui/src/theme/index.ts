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

import { createTheme } from '@mui/material/styles';
import { createSpacing } from '@mui/system';
import colors from './colors';
import '@fontsource/inter';
import '@fontsource/roboto-mono';

const spacing = 10;

declare module '@mui/material/styles/createTheme' {
  interface Theme {
    monotype: {
      fontFamily: string;
      fontWeight: number;
    };
  }

  interface ThemeOptions {
    monotype?: {
      fontFamily?: string;
      fontWeight?: number;
    };
  }

}

declare module '@mui/material/FormHelperText' {
  interface FormHelperTextPropsVariantOverrides {
    right
  }
}

export default createTheme({
  monotype: {
    fontFamily: ['"Roboto Mono"', 'monospace'].join(','),
    fontWeight: 500,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorDefault: {
          backgroundColor: colors.white.main,
        },
        root: {
          boxShadow: 'none',
        },
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          float: 'right' as const,
          paddingBottom: '16px',
          paddingRight: '16px',
        },
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        action: {
          marginRight: '0',
          width: '100%', //TODO why???
        },
      }
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          color: colors.emerald.main,
          minHeight: spacing * 4,
          textTransform: 'none',
        },
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
        contained: {
          backgroundColor: colors.emerald.main,
          boxShadow: 'none',
          color: colors.white.main,
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'secondary' },
          style: {
            backgroundColor: colors.grey200.main,
          }
        }
      ]
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          boxSizing: 'border-box',
          paddingLeft: spacing,
          paddingRight: spacing,
        },
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          bottom: -16,
          fontSize: '0.8rem',
          lineHeight: 1,
          marginTop: 0,
          position: 'absolute',

          variants: [
            {
              props: { variant: 'right' },
              style: {
                position: "inherit",
                paddingLeft: spacing,
              }
            }
          ]
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        }
      }
    },
    MuiInput: {
      defaultProps: {
        disableUnderline: true,
      },
      styleOverrides: {
        root: {
          minHeight: spacing * 5,
        },
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          padding: '0 10px'
        }
      }
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          maxHeight: 'none',
        },
      }
    },
    MuiList: {
      defaultProps: {
        disablePadding: true,
      },
      styleOverrides: {
        root: {
          borderTop: `1px solid ${colors.grey100.main}`,
        },
        padding: {
          paddingBottom: 0,
          paddingTop: 0,
        },
      }
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.grey100.main}`,
          borderRight: 'none',
          borderLeft: 'none',
        },
      }
    },
    MuiMenuItem: {
      styleOverrides: {
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
        }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
        square: true,
      },
      styleOverrides: {
        root: {
          border: `1px solid ${colors.grey100.main}`,

        },
        elevation3: {
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        },
      }
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontSize: '0.8em',
        },
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      }
    },
    MuiToolbar: {
      styleOverrides: {
        gutters: {
          paddingLeft: spacing * 3,
          paddingRight: spacing * 3,
        },
      }
    },
    MuiTypography: {
      defaultProps: {
        color: 'secondary',
      },
      styleOverrides: {
        gutterBottom: {
          marginBottom: spacing * 4,
        },
        paragraph: {
          marginBottom: spacing * 2,
        },
      }
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
  spacing: createSpacing(spacing),
  typography: {
    fontFamily: ['Inter', 'sans-serif'].join(','),
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightMedium: 400,
    fontWeightRegular: 400,
  },
});
