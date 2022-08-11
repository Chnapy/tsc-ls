import ts from 'typescript/lib/tsserverlibrary';

export const createTSProxy = () => {
  const tsFns: Record<string | symbol, any> = {};

  return new Proxy(ts, {
    set: (target, property, value) => {
      tsFns[property] = value;
      return true;
    },
    get: (target, property) =>
      tsFns[property] ?? target[property as keyof typeof ts],
  });
};
