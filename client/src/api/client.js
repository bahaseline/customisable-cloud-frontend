import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({ baseURL: API_BASE_URL, withCredentials: true });
let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

export function refreshAccessToken() {
  // A plain axios call, not apiClient: going through apiClient's own response
  // interceptor here would let a failing refresh re-trigger itself.
  refreshPromise ||= axios
    .post(`${API_BASE_URL}/auth/refresh`, null, {
      withCredentials: true,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
    .then((res) => {
      accessToken = res.data.accessToken;
      return accessToken;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isRefreshCall = config?.url?.includes('/auth/refresh');

    if (response?.status === 401 && config && !config._retried && !isRefreshCall) {
      config._retried = true;
      try {
        const newAccessToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      } catch {
        // The refresh cookie itself is invalid or revoked, so there is nothing
        // left to retry with. Signing out here means every caller sees the same
        // clean state, not just the one that triggered this.
        accessToken = null;
        window.dispatchEvent(new Event('auth:signout'));
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
