# Purpose

Use github gist as a key-value store because it is free and has a well-documented API which we can (ab)use

- create a store is to push something to a gist
- delete a store is to delete that same gist
- on "connect" just download the store and store into a level or redis db
- on "disconnect" just delete the local store
- recommend to users when repos are getting [too big](https://help.github.com/articles/what-is-my-disk-quota/)

# Usage

```js
var gs = require('github-storage')
var db = new gs()
```

Now `db` is an object that will interact with Github to store your data. If you plan on using private gists, you will need to provide authorization as per the [`github`](https://github.com/mikedeboer/node-github) package. If no authorization is provided, you will still be able to `connect` to public gists, but everything else will be restricted.

#### `db.create(dbname, callback)`

Creates a datastore with the name `dbname`

#### `db.destroy(dbname, callback)`

Destroys a datastore with the name `dbname`, provided that it's already been created

#### `db.push(dbname, callback)`

Connects to GitHub and either creates a gist to store the current database, or pushes the current state of the database to the gist

#### `db.pull(dbname, callback)`

Connects to GitHub and either creates a gist to store the current database, or pushes the current state of the database to the gist

#### `db.put(params, callback)`

`params` should have the values for `dbname`, `key`, and `value`

#### `db.get(params, callback)`

`params` should have the values for `dbname`, `key`
