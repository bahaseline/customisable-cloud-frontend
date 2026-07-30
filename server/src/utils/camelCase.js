function toCamel(key) {
  return key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function keysToCamel(value) {
  if (Array.isArray(value)) {
    return value.map(keysToCamel);
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [toCamel(key), keysToCamel(val)])
    );
  }
  return value;
}

module.exports = { keysToCamel };
