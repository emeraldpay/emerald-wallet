import { Button } from '@emeraldwallet/ui';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Dropzone from 'react-dropzone';

export const styles = createStyles({
  container: {
    height: '262px',
    width: '100%',
    border: '2px dashed #E6E6E6',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    margin: '10px',
    color: '#747474'
  },
  dropZoneInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }
});

interface IFileDropFieldProps {
  onChange: any;
  classes: any;
  name: string;
}

interface IFileDropFieldState {
  file: any;
}

class FileDropField extends React.Component<IFileDropFieldProps, IFileDropFieldState> {
  constructor (props: IFileDropFieldProps) {
    super(props);
    this.state = {
      file: null
    };
  }

  public onDrop = (filesToUpload: any, rejectedFiles: any, e: any) => {
    const { onChange } = this.props;
    this.setState({
      file: filesToUpload[0]
    });
    onChange(filesToUpload[0]);
  }

  public render () {
    const { name, classes } = this.props;
    const { file } = this.state;
    return (
        <Dropzone name={name} className={classes.container} multiple={false} onDrop={this.onDrop}>
          <div className={classes.dropZoneInner}>
            {file && (<div className={classes.label}>{file.name}</div>)}
            {!file && (<div className={classes.label}>Drag & drop Account Key File here to import</div>)}

            <div>
              <Button primary={true} label='Select JSON key file' />
            </div>
          </div>
        </Dropzone>
    );
  }
}

export default withStyles(styles)(FileDropField);
