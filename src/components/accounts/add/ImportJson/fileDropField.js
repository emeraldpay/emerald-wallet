import React from 'react';
import Dropzone from 'react-dropzone';
import { Button } from 'emerald-js-ui';

const styles = {
  container: {
    height: '262px',
    width: '100%',
    border: '2px dashed #E6E6E6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },

  label: {
    margin: '10px',
    color: '#747474',
  },
};

class FileDropField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

    onDrop = (filesToUpload, e) => {
      const { onChange } = this.props;
      this.setState({
        file: filesToUpload[0],
      });
      onChange(filesToUpload[0]);
    }

    render() {
      const { name } = this.props;
      const { file } = this.state;
      return (
        <Dropzone name={ name } style={ styles.container } multiple={ false } onDrop={ this.onDrop }>
          { file && (
            <div style={ styles.label }>
              { file.name }
            </div>
          )}
          { !file && (<div style={ styles.label }>Drag & drop Account Key File here to upload</div>)}

          <div>
            <Button primary label="Select account key file" />
          </div>
        </Dropzone>
      );
    }
}

export default FileDropField;
