import React from 'react';
import { connect } from 'react-redux';
import { addAddress } from '../../store/addressActions';
import { gotoScreen } from '../../store/screenActions';
import { AddressForm } from './form';

const AddressAdd = connect(
    (state, ownProps) => {
        return {
            blockAddress: false,
        }
    },
    (dispatch, ownProps) => {
        return {
            onSubmit: data => {
                return new Promise((resolve, reject) => {
                    dispatch(addAddress(data.address, data.name, data.description))
                        .then((response) => {
                            resolve(response);
                            dispatch(gotoScreen('address', data.address));
                        });
                    });
            },
            cancel: () => {
                dispatch(gotoScreen('address-book'));
            }
        }
    }
)(AddressForm);

export default AddressAdd;