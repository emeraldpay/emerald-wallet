import {ActionTypes} from "./types";


export function setWatch(value: boolean) {
  return ({
    type: ActionTypes.WATCH,
    value,
  });
}
