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
var db = gs.authorize()
```

Now `db` is an object that will interact with Github to store your data. If you plan on using private gists, you will need to provide authorization as per the [`github`](https://github.com/mikedeboer/node-github) package. If no authorization is provided, you will still be able to `connect` to public gists, but everything else will be restricted.

#### `db.create(dbname)`

Creates a datastore with the name `dbname`

#### `db.connect(dbname)`

Reads a gist from the given dbname and creates local key-value store. If it is a private gist, you should provide authorization to the client to access it.

#### `db.disconnect(dbname, remote = false)`

Deletes local data store, but leaves the remote intact. To delete the remote datastore also, simply pass `remote = true`.

#### `db.push(dbname)`

Takes the local datastore and pushes it to a gist on Github. Requires that you have already performed `connect`
