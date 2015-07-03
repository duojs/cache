var assert = require('assert');
var Cache = require('..');
var fs = require('co-fs');
var mkdir = require('mkdirp-then');
var path = require('path');
var Promise = require('bluebird');
var rimraf = require('rimraf-then');
var tmp = path.join(require('os').tmpdir(), 'duo-cache');


before(function *() {
  yield mkdir(tmp);
});

after(function *() {
  yield rimraf(tmp);
});

describe('Cache(path)', function () {
  var file = db('constructor-test');

  it('should be a constructor function', function () {
    var cache = new Cache(file);
    assert(cache instanceof Cache);
  });

  it('should set some internal properties', function () {
    var cache = new Cache(file);
    assert.equal(cache.location, file);
  });
});

describe('Cache#update(files)', function () {
  var cache;
  var file = db('update-test');
  var mapping = {
    'a.js': { id: 'a.js', src: 'console.log("Hello World");' }
  };

  before(function *() {
    cache = new Cache(file);
    yield cache.initialize();
    yield cache.update(mapping);
  });

  it('should add all the files to the database', function *() {
    var file = yield cache.file('a.js');
    assert.deepEqual(file, mapping['a.js']);
  });
});

describe('Cache#read()', function () {
  var cache;
  var file = db('read-test');
  var mapping = {
    'a.js': { id: 'a.js', src: 'console.log("Hello World");' },
    'b.js': { id: 'b.js', src: 'console.log("Hello World");' }
  };

  before(function *() {
    cache = new Cache(file);
    yield cache.initialize();
    yield cache.update(mapping);
  });

  it('should read the contents into a single object', function *() {
    var results = yield cache.read();
    assert.deepEqual(results, mapping);
  });
});

describe('Cache#plugin(name, key, value)', function () {
  var cache;
  var file = db('plugin-test');

  before(function *() {
    cache = new Cache(file);
    yield cache.initialize();
  });

  it('should store data to the plugin namespace', function *() {
    yield cache.plugin('babel', 'key', 'value');
    var value = yield cache.plugin('babel', 'key');
    assert.equal(value, 'value');
  });
});

describe('Cache#clean()', function () {
  var cache;
  var file = db('clean-test');

  before(function *() {
    cache = new Cache(file);
    yield cache.initialize();
  });

  it('should delete the entire cache directory', function *() {
    yield cache.clean();
    var exists = yield fs.exists(cache.location);
    assert(!exists);
  });
});


// private helpers

function db(name) {
  return path.join(tmp, name);
}
