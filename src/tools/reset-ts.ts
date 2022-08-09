/* eslint-disable @typescript-eslint/ban-ts-comment */
import ts from 'typescript/lib/tsserverlibrary';

const tsEntries = Object.entries(ts);

/**
 * ts global object may be mutated.
 * Reset it to its initial state.
 */
export const resetTS = () => {
  tsEntries.forEach(([key, value]) => {
    // @ts-ignore
    if (ts[key] !== value) {
      // console.log('clean', key);
      // @ts-ignore
      ts[key] = value;
    }
  });
};
