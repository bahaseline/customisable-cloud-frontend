// Turns whatever a failed request threw into something worth showing a user.
export function errorMessage(err, fallback = 'Something went wrong. Please try again.') {
  const fromApi = err?.response?.data?.error;
  if (fromApi) return fromApi;
  if (err?.response?.status === 429) return 'Too many requests. Please wait a moment.';
  if (err?.code === 'ERR_NETWORK') return 'Could not reach the server. Check your connection.';
  return fallback;
}
