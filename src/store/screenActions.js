export function gotoScreen(screen, item = null) {
    return {
        type: 'SCREEN/OPEN',
        screen,
        item,
    };
}
