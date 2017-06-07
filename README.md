# Purpose

Use [GitHub Gists](https://gist.github.com/) as a key-value store because it is free and has a well-documented API which we can (ab)use.

# Examples

Right now there is no npm package for this, but you can clone this repository to access the code. To run the examples, you can follow these steps.

```shell
git clone git@github.com:SivanMehta/github-storage.git
cd github-storage
yarn install
node examples/server-setup.js
```

This will require that you create a file named `examples/config.json` that takes the following form. You can get an access token [here](https://github.com/settings/tokens).

```json
{
  "token": "YOUR-ACCESS-TOKEN"
}
```

# Usage

```js
var gs = require('github-storage')
var db = new gs({ token: 'YOUR-GITHUB-ACCESS-TOKEN' })
```

Now `db` is an object that will interact with Github to store your data. If you plan on using some other type of authorization, you will need to provide authorization [exactly like you would the `github` package ](https://github.com/mikedeboer/node-github#authentication).

#### `db.create(dbname)`

Creates a datastore with the name `dbname`. This datastore will *automatically* look for your gists that match the title `.-snapshot`.

#### `db.destroy(dbname, callback)`

Destroys a datastore with the name `dbname`, provided that it's already been created

#### `db.push(dbname, callback)`

Connects to GitHub and either creates a gist to store the current database, or pushes the current state of the database to the corresponding gist.

#### `db.pull(dbname, callback)`

Connects to GitHub and replaces the current datastore with whatever is stored in its corresponding gist.

#### `db.put(params, callback)`

Put a value in the datastore. `params` should have the values for `dbname`, `key`, and `value`

#### `db.get(params, callback)`

Get a value from the datastore. `params` should have the values for `dbname`, `key`
