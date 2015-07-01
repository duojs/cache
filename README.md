# duo-cache

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

> The cache duo uses internally during builds.

## API

This cache uses [LevelDB](https://github.com/google/leveldb)
internally (via [level](https://www.npmjs.com/package/level)).
The idea behind this cache is to help speed up duo's builds by
storing data on disk so it can be read quickly later.

### Cache(location)

The `location` refers to the destination of the LevelDB database directory.

### Cache#read()

Reads the all the stored files from the database into memory.

### Cache#update(mapping)

Accepts the updated in-memory `mapping` and saves all the files into cache.

### Cache#file(id, [data])

Can be used to set/get a single file's data from the cache. If `data` is
excluded, it is assumed to be a getter. (otherwise, it will be a setter)

### Cache#clean()

Closes the database and wipes it out from the disk.


## Roadmap

Currently, this implementation only satisfies the bare-minimum based on
duo's current cache implementation. (currently called the "mapping")

Now that there is a robust data-store in place, more features will be added,
including:

 - give plugins a way to get/set cache data (so they can reduce the amount
   of processing they do on repeated builds)
 - store additional processing during the build process (such as the result
   of scanning a file for dependencies)
 - expose this hook to other modules that cache results (eg: gh-resolve)


[npm-image]: https://img.shields.io/npm/v/duo-cache.svg?style=flat
[npm-url]: https://npmjs.org/package/duo-cache
[travis-image]: https://img.shields.io/travis/duojs/duo-cache.svg?style=flat
[travis-url]: https://travis-ci.org/duojs/duo-cache
