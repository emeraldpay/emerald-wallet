import * as React from 'react';
import {CSSProperties, withStyles} from '@material-ui/styles';
import Dropzone from 'react-dropzone';
import { Button } from '@emeraldwallet/ui';

export const styles = {
  container: {
    height: '262px',
    width: '100%',
    border: '2px dashed #E6E6E6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  } as CSSProperties,
  label: {
    margin: '10px',
    color: '#747474',
  },
};

interface IFileDropFieldProps {
  onChange: any;
  classes: any;
  name: string;
}

interface IFileDropFieldState {
  file: any;
}

class FileDropField extends React.Component<IFileDropFieldProps, IFileDropFieldState> {
  constructor(props: IFileDropFieldProps) {
    super(props);
    this.state = {
      file: null,
    };
  }

    onDrop = (filesToUpload: any, rejectedFiles: any, e: any) => {
      const { onChange } = this.props;
      this.setState({
        file: filesToUpload[0],
      });
      onChange(filesToUpload[0]);
    };

    render() {
      const { name, classes } = this.props;
      const { file } = this.state;
      return (
        <Dropzone name={ name } className={ classes.container } multiple={ false } onDrop={ this.onDrop }>
          <div>
            { file && (<div className={ classes.label }>{ file.name }</div>) }
            { !file && (<div className={ classes.label }>Drag & drop Account Key File here to upload</div>) }

            <div>
              <Button primary label="Select account key file" />
            </div>
          </div>
        </Dropzone>
      );
    }
}

export default withStyles(styles)(FileDropField);
