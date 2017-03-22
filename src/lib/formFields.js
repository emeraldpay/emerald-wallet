import React from 'react';
import Dropzone from 'react-dropzone';
import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'

export const renderFileField = ({ input, name, meta: { touched, error } }) => { 

    const files = input.value
    const onDrop = ( filesToUpload, e ) => input.onChange(filesToUpload)

    return (
      <div>
        <Dropzone name={name} style={{}} multiple={false} onDrop={onDrop}>
            <FlatButton label="Select Wallet File..."
                                icon={<FontIcon className="fa fa-briefcase" />}/>
        </Dropzone>
        {files && <div>Selected: {files[0].name}</div>} 
        {touched && error && <span className="error">{error}</span>}    
      </div>
    )
}

export const renderTextField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <TextField {...input} type={type} errorText={touched && error} />
    </div>
  </div>
)