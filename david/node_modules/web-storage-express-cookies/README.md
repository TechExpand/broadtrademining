# web-storage-express-cookies

Use cookies in express through the Storage interface of the Web Storage Api.

- [Installation](#installation)
- [Usage](#usage)

## Installation

```
npm i cookie-parser web-storage-express-cookies
```

## Usage

Make sure you load the `cookieParser` middleware first. After that create the storage in your own middleware.

```js
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use((req, res) => {
  // when we have set three items: fruit=banana,drink=coffee,food=hamburger
  const storage = new ExpressCookies({ req, res });
  console.log(storage.getItem('fruit')); // -> banana
  storage.setItem('girl', 'alice');
  // now the storage will contain: fruit=banana,drink=coffee,food=hamburger,girl=alice
  storage.removeItem('drink');
  // now the storage will contain: fruit=banana,food=hamburger,girl=alice
  storage.clear();
  // now the storage will be empty
});
```

An options object can be passed that will be used on `setItem`, `removeItem` and `clear`.
For all possible values please see [cookie](https://www.npmjs.com/package/cookie#options-1)

```js
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use((req, res) => {
  const storage = new ExpressCookies({ req, res, options: { httpOnly: true } });
});
```

A custom prefix can be passed to override the default one `__cookie-storage__`.

```js
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use((req, res) => {
  // all cookies will be stored with a `__custom-prefix__` prefix.
  const storage = new ExpressCookies({ req, res, prefix: '__custom-prefix__' });
});
```

To make sure `Cookie` is added to the `Vary` header everytime a cookie is read through the `getItem` or `key` methods `setVaryHeader` can be set to `true`, the default value is `false`.

```js
import express from 'express';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
app.use((req, res) => {
  const storage = new ExpressCookies({ req, res, setVaryHeader: true });
});
```
