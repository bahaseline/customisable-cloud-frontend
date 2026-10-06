import { describe, it, expect } from 'vitest';
import { errorMessage } from '../errorMessage';

describe('errorMessage', () => {
  it('prefers the error the API itself reported', () => {
    const err = { response: { status: 409, data: { error: 'That name is already in use' } } };
    expect(errorMessage(err)).toBe('That name is already in use');
  });

  it('explains a rate limit when the server sent no message of its own', () => {
    expect(errorMessage({ response: { status: 429, data: {} } })).toBe(
      'Too many requests. Please wait a moment.'
    );
  });

  it('describes a connection failure rather than blaming the request', () => {
    expect(errorMessage({ code: 'ERR_NETWORK' })).toBe(
      'Could not reach the server. Check your connection.'
    );
  });

  it('falls back for anything it cannot interpret', () => {
    expect(errorMessage(new Error('boom'))).toBe('Something went wrong. Please try again.');
  });

  it('accepts a caller-supplied fallback', () => {
    expect(errorMessage(undefined, 'Could not load tags')).toBe('Could not load tags');
  });

  // The rate-limit default is only used when the server sends no message of its own.
  it('lets an API message win over the rate-limit default', () => {
    const err = { response: { status: 429, data: { error: 'Too many sign-in attempts' } } };
    expect(errorMessage(err)).toBe('Too many sign-in attempts');
  });
});
