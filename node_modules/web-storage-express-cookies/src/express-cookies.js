export class ExpressCookies {
  #req = null;
  #res = null;
  #options = null;
  #prefix = null;
  #setVaryHeader = null;
  constructor({ req, res, options, prefix, setVaryHeader = false }) {
    this.#req = req;
    this.#res = res;
    this.#options = options;
    this.#prefix = prefix ?? '__cookie-storage__';
    this.#setVaryHeader = setVaryHeader;
  }

  #getKeys() {
    return Object.keys(this.#req.cookies).filter(
      (name) => name.indexOf(this.#prefix) === 0
    );
  }

  getItem(name) {
    if (this.#setVaryHeader) {
      this.#res.vary('cookie');
    }
    return this.#req.cookies[`${this.#prefix}${name}`];
  }

  setItem(name, value) {
    this.#res.cookie(`${this.#prefix}${name}`, value, this.#options);
  }

  removeItem(name) {
    this.#res.clearCookie(`${this.#prefix}${name}`, this.#options);
  }

  clear() {
    this.#getKeys().forEach((name) => {
      this.#res.clearCookie(name, this.#options);
    });
  }

  key(index) {
    if (this.#setVaryHeader) {
      this.#res.vary('cookie');
    }
    const key = this.#getKeys()[index] ?? null;
    return key ? key.slice(this.#prefix.length) : null;
  }
}
