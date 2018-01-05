[![npm version](https://badge.fury.io/js/github-gist-db.svg)](https://badge.fury.io/js/github-gist-db)

# Purpose

Use [GitHub Gists](https://gist.github.com/) as a key-value store because it is free and has a well-documented API which we can (ab)use.

# Examples

```shell
git clone git@github.com:SivanMehta/github-storage.git
cd github-storage
npm install
node examples/server-setup.js
```

This will require that you create a file named `examples/config.json` that takes the following form. You can get an access token [here](https://github.com/settings/tokens).

```json
{
  "token": "YOUR-ACCESS-TOKEN"
}
```

# Usage

```
npm install github-gist-db
```

```js
var ggd = require('github-gist-db')
var db = new ggd({ token: 'YOUR-GITHUB-ACCESS-TOKEN' })
```

Now `db` is an object that will interact with Github to store your data. If you plan on using some other type of authorization, you will need to provide authorization [exactly like you would the `github` package ](https://github.com/mikedeboer/node-github#authentication).

| Method | Specification | Description |
|--------------------------------|-------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db.create(dbname)` | returns a `Promise` with success `true`/`false` | Creates a datastore with the name `dbname`. This datastore will *automatically* look for your gists that match the title to the [regex](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) `/.-snapshot/` |
| `db.destroy(dbname, callback)` | Callback with any leveldb errors | Destroys a datastore with the name `dbname`, provided that it's already been created |
| `db.push(dbname, callback)` | Callback with `(err, gistID)` | Connects to GitHub and either creates a gist to store the current database, or pushes the current state of the database to the corresponding gist. |
| `db.pull(dbname, callback)` | Callback with `(success)` | Connects to GitHub and replaces the current datastore with whatever is stored in its corresponding gist. |
| `db.put(params, callback)` | Callback with any leveldb errors | Put a value in the datastore. `params` should have the values for `dbname`, `key`, and `value` |
| `db.get(params, callback)` | Callback with any leveldb errors | Get a value from the datastore. `params` should have the values for `dbname`, `key` |
