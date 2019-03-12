// @flow
import React from 'react';
import withStyles from 'react-jss';
import PropTypes from 'prop-types';
import { AutoComplete } from 'material-ui';

export const styles = {
  container: {
    boxSizing: 'border-box',
    border: '1px solid #DDDDDD',
    borderRadius: '1px',
    paddingLeft: '10px',
    paddingRight: '10px',
  },
};

const predefinedHdPaths = [
  'm/44\'/60\'/160720\'/0\'',
  'm/44\'/61\'/1\'/0',
  'm/44\'/61\'/0\'/0',
  'm/44\'/60\'/0\'/0',
  'm/44\'/60\'/0\'',
];

export class HdPath extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    value: PropTypes.string,
  };

  onUpdateInput = (searchText: string, dataSource: Array<any>, params: any) => {
    if (this.props.onChange) {
      this.props.onChange(searchText);
    }
  };

  render() {
    const { value, classes } = this.props;
    return (
      <div className={ classes.container }>
        <AutoComplete
          searchText={ value }
          filter={ AutoComplete.noFilter }
          openOnFocus={ true }
          dataSource={ predefinedHdPaths }
          onUpdateInput={ this.onUpdateInput }
          underlineShow={ false }
          fullWidth={ true }
        />
      </div>
    );
  }
}


export default withStyles(styles)(HdPath);
