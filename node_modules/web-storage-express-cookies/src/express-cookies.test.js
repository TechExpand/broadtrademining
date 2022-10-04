import { describe, test, jest, expect } from '@jest/globals';
import { ExpressCookies } from './express-cookies.js';

describe('express cookies', () => {
  const prefix = '__test_prefix__';
  const varySpy = jest.fn();
  const cookieSpy = jest.fn();
  const clearCookieSpy = jest.fn();

  test('get existing item', () => {
    const storage = new ExpressCookies({
      req: {
        cookies: {
          ['__cookie-storage__test']: 'example',
        },
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
    });
    expect(storage.getItem('test')).toEqual('example');
  });

  test('get existing item', () => {
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {
          [`${prefix}test`]: 'example',
        },
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
    });
    expect(storage.getItem('test')).toEqual('example');
    expect(varySpy).toBeCalledTimes(0);
  });

  test('get existing item and add cookie to the vary header', () => {
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {
          [`${prefix}test`]: 'example',
        },
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
      setVaryHeader: true,
    });
    expect(storage.getItem('test')).toEqual('example');
    expect(varySpy).toBeCalledTimes(1);
  });

  test('set item', () => {
    const options = {};
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {},
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
      options,
    });
    expect(storage.setItem('test', 'example')).toEqual(undefined);
    expect(cookieSpy).toBeCalledTimes(1);
    expect(cookieSpy).toBeCalledWith(`${prefix}test`, 'example', options);
  });

  test('remove item', () => {
    const options = {};
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {},
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
      options,
    });
    expect(storage.removeItem('test')).toEqual(undefined);
    expect(clearCookieSpy).toBeCalledTimes(1);
    expect(clearCookieSpy).toBeCalledWith(`${prefix}test`, options);
  });

  test('clear storage', () => {
    const options = {};
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {
          [`${prefix}test1`]: 'example',
          [`${prefix}test2`]: 'example',
        },
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
      options,
    });
    expect(storage.clear()).toEqual(undefined);
    expect(clearCookieSpy).toBeCalledTimes(2);
    expect(clearCookieSpy).toBeCalledWith(`${prefix}test1`, options);
    expect(clearCookieSpy).toBeCalledWith(`${prefix}test2`, options);
  });

  test('get item key by index', () => {
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {
          [`${prefix}test1`]: 'example',
          [`${prefix}test2`]: 'example',
        },
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
    });
    expect(storage.key(0)).toEqual('test1');
    expect(storage.key(1)).toEqual('test2');
    expect(storage.key(2)).toEqual(null);
    expect(varySpy).toBeCalledTimes(0);
  });

  test('get item key by index and add cookie to vary header', () => {
    const storage = new ExpressCookies({
      prefix,
      req: {
        cookies: {
          [`${prefix}test1`]: 'example',
          [`${prefix}test2`]: 'example',
        },
      },
      res: {
        vary: varySpy,
        cookie: cookieSpy,
        clearCookie: clearCookieSpy,
      },
      setVaryHeader: true,
    });
    expect(storage.key(0)).toEqual('test1');
    expect(storage.key(1)).toEqual('test2');
    expect(storage.key(2)).toEqual(null);
    expect(varySpy).toBeCalledTimes(3);
  });
});
