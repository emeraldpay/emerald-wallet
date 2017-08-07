import React from 'react';
import { connect } from 'react-redux';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import { FlatButton } from 'material-ui';

export const styles = {
    dialog: {
        marginTop: '20px',
        backgroundColor: 'white',
        paddingTop: '41px',
        paddingBottom: '41px',
    },
    fieldName: {
        color: '#747474',
        fontSize: '16px',
        textAlign: 'right',
    },
    left: {
        flexBasis: '20%',
        marginLeft: '14.75px',
        marginRight: '14.75px',
    },
    right: {
        flexGrow: 2,
        display: 'flex',
        marginLeft: '14.75px',
        marginRight: '14.75px',
        maxWidth: '600px',
    },
    formRow: {
        display: 'flex',
        marginTop: '19px',
        alignItems: 'center',
    },
};

const flatButtonNav = {
    color: '#747474',
    fontSize: '14px',
    lineHeight: '24px',
};


export class InnerDialog extends React.Component {

    render() {
        const { children, caption, onCancel } = this.props;
        const backLabel = 'DASHBOARD';

        return (
            <div style={styles.dialog}>
                <div id="header" style={{display: 'flex', alignItems: 'center'}}>
                    <div style={styles.left}>
                        <FlatButton label={backLabel}
                                    primary={true}
                                    onClick={onCancel}
                                    style={flatButtonNav}
                                    icon={<KeyboardArrowLeft/>}
                        />

                    </div>
                    <div style={styles.right}>
                        <div id="caption" style={{fontSize: '22px'}}>
                            {caption}
                        </div>
                    </div>
                </div>
                <div id="body" style={{paddingTop: '30px'}}>
                    {children}
                </div>
            </div>);
    }
}

