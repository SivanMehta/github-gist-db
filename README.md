Use github gist as a key-value store because it is free and has a well-documented API which we can (ab)use

- create a store is to push something to a gist
- delete a store is to delete that same gist
- on "connect" just download the store and store into a level or redis db
- on "disconnect" just delete the local store
- recommend to users when repos are getting [too big](https://help.github.com/articles/what-is-my-disk-quota/)
- 
