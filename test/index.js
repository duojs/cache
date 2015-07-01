var assert = require('assert');
var Cache = require('..');
var path = require('path');
var Promise = require('native-or-bluebird');

var fs = Promise.promisifyAll(require('fs'));
var mkdir = Promise.promisify(require('mkdirp'));
var rimraf = Promise.promisify(require('rimraf'));
var tmp = path.join(require('os').tmpdir(), 'duo-cache');

before(function () {
  return mkdir(tmp);
});

after(function () {
  return rimraf(tmp);
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

  before(function () {
    cache = new Cache(file);
    return cache.initialize();
  });

  before(function () {
    return cache.update(mapping);
  });

  it('should add all the files to the database', function () {
    cache.file('a.js').then(function (file) {
      assert.deepEqual(file, mapping['a.js']);
    });
  });
});

describe('Cache#read()', function () {
  var cache;
  var file = db('read-test');
  var mapping = {
    'a.js': { id: 'a.js', src: 'console.log("Hello World");' },
    'b.js': { id: 'b.js', src: 'console.log("Hello World");' }
  };

  before(function () {
    cache = new Cache(file);
    return cache.initialize();
  });

  before(function () {
    return cache.update(mapping);
  });

  it('should read the contents into a single object', function () {
    return cache.read().then(function (results) {
      assert.deepEqual(results, mapping);
    });
  });
});

describe('Cache#plugin(name, key, value)', function () {
  var cache;
  var file = db('plugin-test');

  before(function () {
    cache = new Cache(file);
    return cache.initialize();
  });

  it('should store data to the plugin namespace', function () {
    return cache.plugin('babel', 'key', 'value')
      .then(function () {
        return cache.plugin('babel', 'key');
      })
      .then(function (value) {
        assert.equal(value, 'value');
      });
  });
});

describe('Cache#clean()', function () {
  var cache;
  var file = db('clean-test');

  before(function () {
    cache = new Cache(file);
    return cache.initialize();
  });

  it('should delete the entire cache directory', function () {
    return cache.clean()
      .then(function () {
        return fs.exists(cache.location);
      })
      .then(function (exists) {
        assert(!exists);
      });
  });
});


// private helpers

function db(name) {
  return path.join(tmp, name);
}
