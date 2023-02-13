export {
  normalizeHeaders,
  getLocationHost,
};

function normalizeHeaders(headers) {
  const result = {};
  if (!headers) return result;

  for (const key in headers) {
    result[key.toLowerCase()] = headers[key];
  }
  return result;
}

function getLocationHost(headers) {
  let host;
  if (!headers) return host;

  for (const key in headers) {
    if (key.toLowerCase() === "host") host = headers[key];
    if (key.toLowerCase() === "x-forwarded-host") return headers[key];
  }

  return host;
}
