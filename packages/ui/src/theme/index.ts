/*
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
import { createMuiTheme } from '@material-ui/core/styles';
import createSpacing from '@material-ui/core/styles/createSpacing';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import { TypographyProps } from '@material-ui/core/Typography';

import colors from './colors';

const spacing = 10;

const theme = {
  emeraldColors: colors,
  palette: {
    error: {
      main: colors.ruby
    },
    primary: colors.emerald,
    secondary: colors.ash,
    divider: colors.conch.main,
    background: {
      default: colors.snow
    },
    action: {
      selected: colors.snow,
      hover: 'none'
    },
    text: {
      primary: colors.coal,
      secondary: colors.ash.main
    }
  },
  spacing: createSpacing(spacing),
  typography: {
    fontSize: 16,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 400,
    fontFamily: [
      '"Rubik"',
      '"Roboto"',
      'sans-serif'
    ].join(',')
  },
  overrides: {
    MuiFormControl: {
      root: {
        boxSizing: 'border-box',
        borderRadius: '1px',
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: colors.conch.main,
        paddingLeft: spacing,
        paddingRight: spacing
      } as CSSProperties
    },
    MuiFormHelperText: {
      root: {
        position: 'absolute',
        bottom: -(spacing * 2)
      } as CSSProperties
    },
    MuiButton: {
      root: {
        color: colors.emerald.main,
        borderRadius: 0,
        minHeight: spacing * 4
      },
      contained: {
        color: colors.white.main,
        backgroundColor: colors.emerald.main,
        boxShadow: 'none'
      }
    },
    MuiToolbar: {
      gutters: {
        paddingLeft: spacing * 3,
        paddingRight: spacing * 3
      }
    },
    MuiInputAdornment: {
      root: {
        maxHeight: 'none'
      }
    },
    MuiInput: {
      root: {
        minHeight: spacing * 5
      }
    },
    MuiAppBar: {
      root: {
        boxShadow: 'none'
      },
      colorDefault: {
        backgroundColor: colors.white.main
      }
    },
    MuiList: {
      root: {
        borderTop: `1px solid ${colors.conch.main}`
      },
      padding: {
        paddingTop: 0,
        paddingBottom: 0
      }

    },
    MuiListItem: {
      root: {
        borderBottom: `1px solid ${colors.conch.main}`,
        borderRight: 'none',
        borderLeft: 'none'
      }
    },
    MuiPaper: {
      root: {
        border: `1px solid ${colors.conch.main}`
      }
    },
    MuiMenuItem: {
      root: {
        'cursor': 'pointer',
        'padding': `${spacing / 2}px ${spacing * 8}px ${spacing / 2}px ${spacing * 4}px`,
        'border': 'none',
        'lineHeight': `${spacing * 2}px`,
        'marginLeft': spacing / 2,
        'height': 'auto',
        '&$selected': {
          marginLeft: '0',
          borderLeft: `${spacing / 2}px solid ${colors.emerald.main}`
        }
      }
    },
    MuiTypography: {
      gutterBottom: {
        marginBottom: spacing * 4
      },
      paragraph: {
        marginBottom: spacing * 2
      }
    }
  },
  props: {
    MuiTypography: {
      color: 'secondary'
    } as Partial<TypographyProps>,
    MuiInput: {
      disableUnderline: true
    },
    MuiFormHelperText: {
      error: true
    },
    MuiPaper: {
      square: true,
      elevation: 0
    },
    MuiList: {
      disablePadding: true
    }
  }
};

export default createMuiTheme(theme);
