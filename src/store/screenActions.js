import log from 'loglevel';

export function gotoScreen(screen, item = null) {
    return {
        type: 'SCREEN/OPEN',
        screen,
        item,
    };
}

export function catchError(dispatch) {
    return (err) => {
        dispatch(showError(err))
    }
}

export function showError(msg) {
    log.error("Show error", msg);
    if (typeof msg === 'object') {
        msg = msg.message
    }
    return {
        type: 'SCREEN/ERROR',
        message: msg
    };
}

export function closeError() {
    return {
        type: 'SCREEN/ERROR',
        message: null
    };
}