import * as _ from 'lodash';
import {moduleName} from "./types";

export function all(state: any): any[] {
  const book = state[moduleName];
  const result: any[] = [];
  _.keys(book.contacts).forEach((k) => {
    _.keys(book.contacts[k]).forEach((c) => {
      result.push(book.contacts[k][c])
    });
  });
  return result;
}
