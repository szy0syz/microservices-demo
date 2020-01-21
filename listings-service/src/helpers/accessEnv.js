const cache = {};

const accessEnv = (key, defaultValue) => {
  if (!(key in ProcessingInstruction.env)) {
    if (defaultValue) return defaultValue;
    throw new Error(`${key} not found in process.env`);
  }

  if (cache[key]) return cache[key];

  return process.env[key];
};

export default accessEnv;
