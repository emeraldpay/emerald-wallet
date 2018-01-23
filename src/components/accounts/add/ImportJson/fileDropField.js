import React from 'react';
import Dropzone from 'react-dropzone';
import { Button } from 'emerald-js-ui';
import styles from './fileDropField.scss';

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
        <Dropzone name={ name } className={ styles.container } multiple={ false } onDrop={ this.onDrop }>
          { file && (
            <div className={ styles.label }>
              { file.name }
            </div>
          )}
          { !file && (<div className={ styles.label }>Drag & drop Account Key File here to upload</div>)}

          <div>
            <Button primary label="Select account key file" />
          </div>
        </Dropzone>
      );
    }
}

export default FileDropField;
