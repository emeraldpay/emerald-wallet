// @flow
/* eslint react/prop-types: 0 */
import React from 'react';
import Dropzone from 'react-dropzone';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import { Toolbox as ToolboxIcon } from 'emerald-js-ui/lib/icons3';

export const renderFileField = ({ input, name, meta: { touched, error } }) => {
  const files = input.value;
  const onDrop = (filesToUpload) => input.onChange(filesToUpload);

  return (
    <div>
      <Dropzone name={name} style={{}} multiple={false} onDrop={onDrop}>
        <FlatButton label="Select Wallet File..."
          icon={<ToolboxIcon />}/>
      </Dropzone>
      {files && <div>Selected: {files[0].name}</div>}
      {touched && error && <span className="error">{error}</span>}
    </div>
  );
};

export const renderTextField = ({ input, label, type, disabled, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <TextField {...input} type={type} disabled={disabled} errorText={touched && error} />
    </div>
  </div>
);

export const renderCodeField = ({ input, label, type, rows, meta: { touched, error } }) => {
  const style = {
    fontFamily: 'monospace',
    letterSpacing: '.02em',
    marginTop: '5px',
    padding: '5px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    overflow: 'auto',
    outline: '1px solid rgb(224, 224, 224)',
  };

  return (
    <div>
      <label>{label}</label>
      <div>
        <TextField {...input}
          type={type}
          textareaStyle={style}
          multiLine={true}
          rows={rows}
          rowsMax={rows}
          fullWidth={true}
          errorText={touched && error} />
      </div>
    </div>
  );
};


export const renderSelectField = ({ input, label, type, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    <div>
      <SelectField {...input} type={type} errorText={touched && error} />
    </div>
  </div>
);


export const renderCheckboxField = ({ input, label, options, meta: { touched, error } }) => (
  <div>
    <label>{label}</label>
    {options.map((option, index) =>
      <Checkbox label={option} value={option} key={index}
        onCheck={ (event) => {
          const value = [...input.value];
          if (event.target.checked) { value.push(option); } else { value.splice(value.indexOf(option), 1); }
          return input.onChange(value);
        }}/>
    )}
  </div>
);

