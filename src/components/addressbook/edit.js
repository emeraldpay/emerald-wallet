import React from 'react';
import { connect } from 'react-redux';
import { AddressForm } from './form';

const AddressEdit = connect(
    (state, ownProps) => {
        return {
            initialValues: {
                name: ownProps.address.get('name'),
                address: ownProps.address.get('id'),
                description: ownProps.address.get('description')
            }
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {
                ownProps.submit(data)
            },
            cancel: () => {
                ownProps.cancel()
            }
        }
    }
)(AddressForm);

export default AddressEdit;