var assert = require('assert');
var expect = require('chai').expect;

var fs = require('fs');

var Oracle = require('../lib/oracle');

var key = '/test';
var list = '/messages';
var data = require('../data/message');

describe('Oracle', function () {
  it('should expose a constructor', function () {
    assert.equal(typeof Oracle, 'function');
  });
  
  it('can emulate HTTP PUT', async function () {
    var oracle = new Oracle();
    var result = await oracle._PUT(key, data['@data']);
    await oracle.storage.close();
    assert.ok(result);
  });

  it('can emulate HTTP GET', async function () {
    var oracle = new Oracle();
    var starts = await oracle._PUT(key, data['@data']);
    var result = await oracle._GET(key);
    await oracle.storage.close();
    assert.ok(result);
  });
  
  it('can emulate HTTP POST', async function () {
    var oracle = new Oracle();
    var setup = await oracle._PUT(list, []);
    var result = await oracle._POST(list, data['@data']);
    var output = await oracle._GET(list);

    output = JSON.parse(output);
    
    await oracle.storage.close();
    
    assert.equal(output.length, 1);
    assert.equal(output[0], data['@data']);
    assert.ok(result);
  });

  it('can emulate HTTP PATCH', async function () {
    var oracle = new Oracle();
    var setup = await oracle._PUT(list, []);
    var result = await oracle._POST(list, data['@data']);
    var patches = await oracle._PATCH(list, [{
      extra: 'foo'
    }]);
    var output = await oracle._GET(list);

    output = JSON.parse(output);

    await oracle.storage.close();

    assert.equal(output[0].extra, 'foo');
    assert.ok(result);
  });

  it('can emulate HTTP DELETE', async function () {
    var oracle = new Oracle();
    var setup = await oracle._PUT(list, []);
    var result = await oracle._POST(list, data['@data']);
    var output = await oracle._DELETE(list);

    output = JSON.parse(output);

    await oracle.storage.close();

    assert.equal(output, null);
  });
  
  it('can load from a directory', async function () {
    fs.writeFileSync('./assets/test.txt', 'Hello, world!', 'utf8');

    var oracle = new Oracle();
    var output = await oracle._load('./assets');
    var assets = await oracle._OPTIONS('/assets');
    var result = await oracle._OPTIONS('/assets/test.txt');

    await oracle.storage.close();

    assert.equal(assets['@id'], '1fa3a4bf64a8a1fe0a335bd344a89495d7014ef05633653b53f279cc2b7dd743');
    assert.equal(result['@id'], '4759427e7a377446d535011d3618ebaa207d697c1e9833e1c3e6018408a9d199');

  });
});
