import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const apiClient = axios.create({ baseURL: API_BASE_URL });

apiClient.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available');

  // A plain axios call, not apiClient: going through apiClient's own
  // response interceptor here would risk this failing 401 re-triggering the
  // very refresh flow it is part of.
  const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  localStorage.setItem('accessToken', res.data.accessToken);
  localStorage.setItem('refreshToken', res.data.refreshToken);
  return res.data.accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const isRefreshCall = config?.url?.includes('/auth/refresh');

    if (response?.status === 401 && config && !config._retried && !isRefreshCall) {
      config._retried = true;
      try {
        refreshPromise ||= refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
        const newAccessToken = await refreshPromise;
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(config);
      } catch {
        // The refresh token itself is invalid or revoked — there is nothing
        // left to retry with. Clearing here (rather than in AuthContext)
        // means every caller sees the same clean, signed-out state
        // immediately, not just the one that happened to trigger this.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
export { API_BASE_URL };
