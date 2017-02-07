export function open(screen, item = null) {
    return {
        type: 'SCREEN/OPEN',
        screen: screen,
        item: item
    }
}