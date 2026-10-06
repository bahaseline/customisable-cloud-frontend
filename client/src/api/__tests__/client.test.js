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

async function loadClient() {
  // Each test needs a module instance with a fresh `refreshPromise`.
  vi.resetModules();
  return (await import('../client')).default;
}

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'expired-access');
  localStorage.setItem('refreshToken', 'valid-refresh');

  postMock = vi.fn(async () => ({
    data: { accessToken: 'fresh-access', refreshToken: 'rotated-refresh' },
  }));
  handler = vi.fn(async () => ({ data: {} }));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('apiClient request interceptor', () => {
  it('attaches the stored access token', async () => {
    const apiClient = await loadClient();
    await apiClient({ url: '/api/lists' });

    expect(handler.mock.calls[0][0].headers.Authorization).toBe('Bearer expired-access');
  });

  it('sends no Authorization header when signed out', async () => {
    localStorage.clear();
    const apiClient = await loadClient();
    await apiClient({ url: '/api/lists' });

    expect(handler.mock.calls[0][0].headers.Authorization).toBeUndefined();
  });
});

describe('apiClient refresh-on-401', () => {
  it('refreshes once and retries the original request with the new token', async () => {
    handler = vi
      .fn()
      .mockRejectedValueOnce(unauthorized())
      .mockResolvedValue({ data: { lists: [] } });

    const apiClient = await loadClient();
    const res = await apiClient({ url: '/api/lists' });

    expect(res.data).toEqual({ lists: [] });
    expect(postMock).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler.mock.calls[1][0].headers.Authorization).toBe('Bearer fresh-access');
  });

  it('stores both rotated tokens', async () => {
    handler = vi.fn().mockRejectedValueOnce(unauthorized()).mockResolvedValue({ data: {} });

    const apiClient = await loadClient();
    await apiClient({ url: '/api/lists' });

    expect(localStorage.getItem('accessToken')).toBe('fresh-access');
    expect(localStorage.getItem('refreshToken')).toBe('rotated-refresh');
  });

  // The refresh flow is a single promise shared by all requests that fail with 401 while it is pending.
  it('collapses concurrent 401s into a single refresh', async () => {
    let releaseRefresh;
    postMock = vi.fn(
      () =>
        new Promise((resolve) => {
          releaseRefresh = () =>
            resolve({ data: { accessToken: 'fresh-access', refreshToken: 'rotated-refresh' } });
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

    const apiClient = await loadClient();
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

    const apiClient = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(postMock).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('clears both tokens when the refresh token is itself rejected', async () => {
    handler = vi.fn(async () => {
      throw unauthorized();
    });
    postMock = vi.fn(async () => {
      throw new Error('refresh rejected');
    });

    const apiClient = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toBeTruthy();

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('does not attempt a refresh when there is no refresh token', async () => {
    localStorage.removeItem('refreshToken');
    handler = vi.fn(async () => {
      throw unauthorized();
    });

    const apiClient = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toBeTruthy();

    expect(postMock).not.toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  // A failing /auth/refresh must not re-enter the refresh flow it is part of.
  it('never refreshes in response to the refresh call failing', async () => {
    handler = vi.fn(async () => {
      throw unauthorized();
    });

    const apiClient = await loadClient();
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

    const apiClient = await loadClient();
    await expect(apiClient({ url: '/api/lists' })).rejects.toMatchObject({
      response: { status: 500 },
    });

    expect(postMock).not.toHaveBeenCalled();
    expect(localStorage.getItem('accessToken')).toBe('expired-access');
  });
});
