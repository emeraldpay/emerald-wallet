/*
 * Placeholder for IPC calls to connector
 *
*/

let requestSeq = 1;

export function ipc(name, params) {
    const data = {
        "method": name,
        "params": params,
        "id": requestSeq++
    };
    return sleep(1000) // simulate server latency
        .then((response) => response.json())
}