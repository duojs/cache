
/**
 * Module dependiencs.
 */

var debug = require('debug')('duo-cache');
var level = require('level');
var unyield = require('unyield');
var values = require('object-values');
var wrap = require('co-level');

/**
 * Single export.
 */

module.exports = Cache;

/**
 * Represents a cache for duo to use during builds.
 *
 * @constructor
 * @param {String} location
 */

function Cache(location) {
  debug('new instance', location);
  this.location = location;
}

/**
 * Initializes the instance and opens the database.
 *
 * @returns {Promise}
 */

Cache.prototype.initialize = unyield(function *() {
  if (!this.leveldb) {
    this.leveldb = wrap(level(this.location, {
      keyEncoding: 'json',
      valueEncoding: 'json'
    }));
  }

  return yield this.leveldb.open();
});

/**
 * Reads the list of files into memory.
 *
 * TODO: this should probably be renamed to something more
 * descriptive in the future.
 *
 * TODO: refactor this to be more co-like.
 *
 * @returns {Promise}
 */

Cache.prototype.read = unyield(function *() {
  debug('reading mapping from disk');
  var db = this.leveldb;
  var ret = {};

  return yield function (done) {
    db.createReadStream()
      .on('error', function (err) {
        debug('error reading', err.stack);
        done(err);
      })
      .on('data', function (data) {
        if (data.key[0] !== 'file') return;
        var file = data.value;
        debug('file read', file.id);
        ret[file.id] = file;
      })
      .on('end', function () {
        done(null, ret);
      });
  };
});

/**
 * Accepts an in-memory mapping and updates the specified files in the cache.
 *
 * TODO: this should probably be made a little more generic in the future.
 *
 * @param {Object} mapping  The list of files to update
 * @returns {Promise}
 */

Cache.prototype.update = unyield(function *(mapping) {
  var db = this.leveldb;

  var ops = values(mapping).map(function (file) {
    return { type: 'put', key: [ 'file', file.id ], value: file };
  }, this);

  debug('updating %d files', ops.length);
  return yield db.batch(ops);
});

/**
 * Get/Set a single file's cache data.
 *
 * @param {String} id    The key to use for the database
 * @param {Object} data  The value to store
 * @returns {Promise}
 */

Cache.prototype.file = unyield(function *(id, data) {
  var db = this.leveldb;
  var key = [ 'file', id ];

  if (data) {
    debug('update file: %s', id);
    return yield db.put(key, data);
  } else {
    debug('get file: %s', id);
    return yield db.get(key);
  }
});

/**
 * Get/Set a cache item on behalf of a plugin.
 *
 * @param {String} name  The plugin's name
 * @param {String} id    The key to use for the database
 * @param {Object} data  The value to store
 * @returns {Promise}
 */

Cache.prototype.plugin = unyield(function *(name, id, data) {
  var db = this.leveldb;
  var key = [ 'plugin', name, key ];

  if (data) {
    debug('setting %s data for %s plugin', key, name);
    return yield db.put(key, data);
  } else {
    debug('getting %s data for %s plugin', key, name);
    try {
      return yield db.get(key);
    } catch (err) {
      // not found
      return false;
    }
  }
});

/**
 * Wipes out the cache from disk.
 *
 * @returns {Promise}
 */

Cache.prototype.clean = unyield(function *() {
  var db = this.leveldb;
  var location = this.location;

  debug('cleaning database');
  yield db.close();
  yield function (done) {
    level.destroy(location, done);
  };
});
