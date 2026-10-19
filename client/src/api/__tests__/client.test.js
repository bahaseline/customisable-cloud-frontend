import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock axios to control the behavior of the apiClient module under test.
let handler;
let postMock;

vi.mock('axios', () => {
  const create = () => {
    const requestInterceptors = [];
    const responseInterceptors = [];

    const instance = async (config) => {
      let finalConfig = { headers: {}, ...config };
      for (const onFulfilled of requestInterceptors) {
        finalConfig = await onFulfilled(finalConfig);
      }

      try {
        return await handler(finalConfig);
      } catch (error) {
        error.config = finalConfig;
        let result = Promise.reject(error);
        for (const { onRejected } of responseInterceptors) {
          result = result.catch((err) => onRejected(err));
        }
        return result;
      }
    };

    instance.interceptors = {
      request: { use: (onFulfilled) => requestInterceptors.push(onFulfilled) },
      response: {
        use: (onFulfilled, onRejected) => responseInterceptors.push({ onFulfilled, onRejected }),
      },
    };
    return instance;
  };

  return { default: { create, post: (...args) => postMock(...args) } };
});

function unauthorized() {
  const err = new Error('Request failed with status code 401');
  err.response = { status: 401, data: { error: 'Invalid or expired token' } };
  return err;
}

// Each test needs a fresh module, so the in-memory token and shared refresh
// promise start empty.
async function loadClient({ signedIn = true } = {}) {
  vi.resetModules();
  const mod = await import('../client');
  if (signedIn) mod.setAccessToken('expired-access');
  return mod;
}

beforeEach(() => {
  localStorage.clear();
  postMock = vi.fn(async () => ({ data: { accessToken: 'fresh-access' } }));
  handler = vi.fn(async () => ({ data: {} }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient request interceptor', () => {
  it('attaches the in-memory access token', async () => {
    const { default: apiClient } = await loadClient();
    await apiClient({ url: '/api/lists' });

    expect(handler.mock.calls[0][0].headers.Authorization).toBe('Bearer expired-access');
  });

  it('sends no Authorization header when signed out', async () => {
    const { default: apiClient } = await loadClient({ signedIn: false });
    await apiClient({ url: '/api/lists' });

    expect(handler.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });
});

describe('refreshAccessToken', () => {
  it('sends the refresh cookie with the CSRF header and no token in the body', async () => {
    const { refreshAccessToken } = await loadClient();
    await refreshAccessToken();

    const [url, body, options] = postMock.mock.calls[0];
    expect(url).toMatch(/\/auth\/refresh$/);
    expect(body).toBeNull();
    expect(options.withCredentials).toBe(true);
    expect(options.headers['X-Requested-With']).toBe('XMLHttpRequest');
  });

  // Session restore can run twice at startup (React StrictMode). Two parallel
  // refreshes would rotate the cookie twice and revoke each other.
  it('shares one in-flight refresh between simultaneous callers', async () => {
    const { refreshAccessToken } = await loadClient();
    const [a, b] = await Promise.all([refreshAccessToken(), refreshAccessToken()]);

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(a).toBe('fresh-access');
    expect(b).toBe('fresh-access');
  });
});

describe('apiClient refresh-on-401', () => {
  it('refreshes once and retries the original request with the new token', async () => {
    handler = vi
      .fn()
      .mockRejectedValueOnce(unauthorized())
      .mockResolvedValue({ data: { lists: [] } });

    const { default: apiClient } = await loadClient();
    const res = await apiClient({ url: '/api/lists' });

    expect(res.data).toEqual({ lists: [] });
    expect(postMock).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0].headers.Authorization).toBe('Bearer fresh-access');
  });

  it('keeps the new access token in memory and writes nothing to localStorage', async () => {
    handler = vi.fn().mockRejectedValueOnce(unauthorized()).mockResolvedValue({ data: {} });

    const { default: apiClient } = await loadClient();
    await apiClient({ url: '/api/lists' });
    await apiClient({ url: '/api/tags' });

    expect(handler.mock.calls[2][0].headers.Authorization).toBe('Bearer fresh-access');
    expect(localStorage.length).toBe(0);
  });

  it('collapses concurrent 401s into a single refresh', async () => {
    let releaseRefresh;
    postMock = vi.fn(
      () =>
        new Promise((resolve) => {
          releaseRefresh = () => resolve({ data: { accessToken: 'fresh-access' } });
        })
    );

    const failed = new Set();
    handler = vi.fn(async (config) => {
      if (!failed.has(config.url)) {
        failed.add(config.url);
        throw unauthorized();
      }
      return { data: { url: config.url } };
    });

    const { default: apiClient } = await loadClient();
    const pending = Promise.all([
      apiClient({ url: '/api/lists' }),
      apiClient({ url: '/api/tags' }),
      apiClient({ url: '/api/files' }),
    ]);

    await vi.waitFor(() => expect(releaseRefresh).toBeDefined());
    releaseRefresh();
    const results = await pending;

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(results.map((r) => r.data.url)).toEqual(['/api/lists', '/api/tags', '/api/files']);
  });

  it('retries a given request only once, surfacing a second 401', async () => {
    handler = vi.fn(async () => {
      throw unauthorized();
    });

    const { default: apiClient } = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('signs out and forgets the access token when the refresh cookie is rejected', async () => {
    handler = vi.fn(async () => {
      throw unauthorized();
    });
    postMock = vi.fn(async () => {
      throw new Error('refresh rejected');
    });
    const onSignout = vi.fn();
    window.addEventListener('auth:signout', onSignout);

    const { default: apiClient } = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toBeTruthy();
    window.removeEventListener('auth:signout', onSignout);

    expect(onSignout).toHaveBeenCalledTimes(1);
    handler = vi.fn(async () => ({ data: {} }));
    await apiClient({ url: '/api/lists' });
    expect(handler.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });

  // A failing /auth/refresh must not re-enter the refresh flow it is part of.
  it('never refreshes in response to the refresh call failing', async () => {
    handler = vi.fn(async () => {
      throw unauthorized();
    });

    const { default: apiClient } = await loadClient();
    await expect(apiClient({ url: '/auth/refresh' })).rejects.toBeTruthy();

    expect(postMock).not.toHaveBeenCalled();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('passes non-401 failures straight through', async () => {
    const serverError = new Error('boom');
    serverError.response = { status: 500, data: { error: 'Internal server error' } };
    handler = vi.fn(async () => {
      throw serverError;
    });

    const { default: apiClient } = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toMatchObject({
      response: { status: 500 },
    });

    expect(postMock).not.toHaveBeenCalled();
  });
});
