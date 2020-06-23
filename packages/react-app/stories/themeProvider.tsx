import * as React from "react";
import {Theme} from "@emeraldwallet/ui";
import {ThemeProvider} from "@material-ui/core/styles";

const withTheme = (story) => (
  <ThemeProvider theme={Theme}>
    {story()}
  </ThemeProvider>
);

export default withTheme;