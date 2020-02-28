import { Blockchains, blockchains } from '@emeraldwallet/core';
import { MenuItem, Paper, TextField } from '@material-ui/core';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import * as Autosuggest from 'react-autosuggest';

interface IDPath {
  value: string;
  label: string;
}

const dPaths: IDPath[] = Object.keys(blockchains.Blockchains)
  .map<IDPath>((chainCode: string) => ({
    value: Blockchains[chainCode].params.hdPath,
    label: Blockchains[chainCode].getTitle()
  }));

export const styles = (theme?: any) => createStyles({
  container: {
    position: 'relative'
  },
  suggestionsContainer: {
    border: 'none'
  },
  suggestionsContainerOpen: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    right: 0,
    border: `1px solid ${theme.palette && theme.palette.divider}`
  },
  suggestionsList: {
    margin: 0,
    padding: 0,
    listStyleType: 'none'
  },
  suggestion: {
    display: 'block'
  },
  suggestionLabel: {
    color: theme.pallete && theme.pallete.text.secondary
  }
});

const predefinedHdPaths = dPaths;

interface IProps {
  onChange?: any;
  value?: string;
  classes?: any;
}

interface IState {
  value?: any;
  suggestions?: any;
}

function renderInputComponent (inputProps) {
  const { classes, inputRef = () => {}, ref, endAdornment, ...other } = inputProps;

  return (
    <TextField
      fullWidth={true}
      InputProps={{
        inputRef: (node) => {
          ref(node);
          inputRef(node);
        },
        endAdornment
      }}
      {...other}
    />
  );
}

const suggestionStyles = (theme?: any) => createStyles({
  labelText: {
    color: theme.pallete && theme.pallete.secondary
  }
});

function SuggestionItem (props: any) {
  const { value, label, classes, isHighlighted } = props;
  return (
    <MenuItem selected={isHighlighted} component='div'>
      <div>
        {value} <span className={classes.labelText}>{label}</span>
      </div>
    </MenuItem>
  );
}

const StyledSuggestionItem = withStyles(suggestionStyles)(SuggestionItem);

function renderSuggestion (suggestion, { query, isHighlighted }) {
  return (
    <StyledSuggestionItem
      value={suggestion.value}
      label={suggestion.label}
      isHighlighted={isHighlighted}
    />
  );
}

export class HdPath extends React.Component<IProps, IState> {
  public state = {
    suggestion: [],
    value: this.props.value
  };

  public handleChange = (event, { newValue }) => {
    if (this.props.onChange && this.state.value !== newValue) {
      this.props.onChange(newValue);
    }
    this.setState({
      value: newValue
    });
  }

  public handleSuggestionsFetchRequested = ({ value }) => {
    // We ignore input value and show all possible suggestions
    this.setState({
      suggestions: predefinedHdPaths
    });
  }

  public handleSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  }

  public render () {
    function shouldRenderSuggestions (suggestion: string): boolean {
      return true;
    }

    function getSuggestion (suggestion: any) {
      return suggestion.value;
    }

    const { value, classes } = this.props;
    return (
      <div className={classes.container}>
        <Autosuggest
          shouldRenderSuggestions={shouldRenderSuggestions}
          renderInputComponent={renderInputComponent}
          suggestions={predefinedHdPaths}
          onSuggestionsFetchRequested={this.handleSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.handleSuggestionsClearRequested}
          getSuggestionValue={getSuggestion}
          renderSuggestion={renderSuggestion}
          inputProps={{
            placeholder: "m/44'/60'/160720'/0'",
            value: this.state.value,
            onChange: this.handleChange
          }}
          theme={{
            container: classes.container,
            suggestionsContainer: classes.suggestionsContainer,
            suggestionsContainerOpen: classes.suggestionsContainerOpen,
            suggestionsList: classes.suggestionsList,
            suggestion: classes.suggestion
          }}
          renderSuggestionsContainer={(options) => (
            <Paper {...options.containerProps} square={true}>
              {options.children}
            </Paper>
          )}
        />
      </div>
    );
  }
}

export default withStyles(styles)(HdPath);
