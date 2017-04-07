import React from 'react';
import { connect } from 'react-redux';

export const DescriptionList = (props) => {
    const style = {
        width: '100%',
        overflow: 'hidden'
    };
    return (
        <dl style={style} {...props}>
            {props.children}
        </dl>
    );
};

export const DescriptionTitle = (props) => {
    const style = {
        float: 'left',
        width: '35%',
        textAlign: "right",
        margin: 0,
        padding: "0 5px 0 0",
        fontWeight: 900
    };
    return (
        <dt style={style} {...props}>
            {props.children}
        </dt>
    );
};

export const DescriptionData = (props) => {
    const style = {
        float: 'left',
        width: '60%',
        margin: 0,
        padding: "0 0 0 5px"
    };
    return (
        <dd style={style} {...props}>
            {props.children}
        </dd>
    );
};

