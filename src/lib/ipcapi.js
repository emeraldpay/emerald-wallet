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
    return new Promise(resolve => setTimeout(resolve, 1000))
        .then((response) => {
            if (name === "backend_importWallet")
                return {"result": "0xfakeAccount000"};
        })
}