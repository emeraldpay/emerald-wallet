import * as React from 'react';
import * as Autosuggest from 'react-autosuggest';
import Paper from "@material-ui/core/Paper";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from '@material-ui/core/TextField';
import {CSSProperties, withStyles} from '@material-ui/styles';

export const styles = (theme) => ({
  container: {
    position: "relative"
  } as CSSProperties,
  suggestionsContainer: {
    border: 'none',
  },
  suggestionsContainerOpen: {
    position: "absolute",
    zIndex: 1,
    left: 0,
    right: 0,
    border: `1px solid ${theme.palette && theme.palette.divider}`,
  } as CSSProperties,
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: "none"
  },
  suggestion: {
    display: "block"
  },
});

const predefinedHdPaths = [
  'm/44\'/60\'/160720\'/0\'',
  'm/44\'/61\'/1\'/0',
  'm/44\'/61\'/0\'/0',
  'm/44\'/60\'/0\'/0',
  'm/44\'/60\'/0\'',
];

interface Props {
  onChange?: any;
  value?: string;
  classes?: any;
}

interface State {
  value?: any;
  suggestions?: any;
}

function renderInputComponent(inputProps) {
  const { classes, inputRef = () => {}, ref, endAdornment, ...other } = inputProps;

  return (
    <TextField
      fullWidth
      InputProps={{
        inputRef: node => {
          ref(node);
          inputRef(node);
        },
        classes: {
          input: classes.input
        },
        endAdornment,
      }}
      {...other}
    />
  );
}

function renderSuggestion(suggestion, { query, isHighlighted }) {
  return (
    <MenuItem selected={isHighlighted} component="div">
      <div>
        {suggestion}
      </div>
    </MenuItem>
  );
}

export class HdPath extends React.Component<Props, State> {
  state = {
    suggestion: [],
    value: this.props.value
  };

  handleChange = (event, { newValue }) => {
    if (this.props.onChange && this.state.value != newValue) {
      this.props.onChange(newValue);
    }
    this.setState({
      value: newValue
    });

  };

  handleSuggestionsFetchRequested = ({ value }) => {
    // We ignore input value and show all possible suggestions
    this.setState({
      suggestions: predefinedHdPaths
    });
  };

  handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, classes } = this.props;
    return (
      <div className={ classes.container }>
        <Autosuggest
          shouldRenderSuggestions = {(val) => (true)}
          renderInputComponent = {renderInputComponent}
          suggestions = {predefinedHdPaths}
          onSuggestionsFetchRequested = {this.handleSuggestionsFetchRequested}
          onSuggestionsClearRequested = {this.handleSuggestionsClearRequested}
          getSuggestionValue = { (suggestion) => (suggestion) }
          renderSuggestion={ renderSuggestion }
          inputProps={{
            classes,
            placeholder: "m/44'/60'/160720'/0'",
            value: this.state.value,
            onChange: this.handleChange,
          }}
          theme={{
            container: classes.container,
            suggestionsContainer: classes.suggestionsContainer,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion
          }}
          renderSuggestionsContainer={options => (
            <Paper {...options.containerProps} square>
              {options.children}
            </Paper>
          )}
        />
      </div>
    );
  }
}


export default withStyles(styles)(HdPath);
