import test from 'tape';

import RefMock from './RefMock';
import { FirebaseList } from '../src';

test('FirebaseList', t => {
  const listRef = new RefMock();
  const nameRefs = {};
  nameRefs.foo = new RefMock();
  nameRefs.bar = new RefMock();

  const list = new FirebaseList(listRef, key => ({
    name: nameRefs[key],
  }));

  list.on('value', () => null);

  t.equal(list.listeners('value').length, 1);
  t.equal(listRef.listeners('child_added').length, 1);
  t.equal(listRef.listeners('child_removed').length, 1);
  t.equal(listRef.listeners('value').length, 0);
  t.equal(nameRefs.foo.listeners('value').length, 0);
  t.equal(nameRefs.bar.listeners('value').length, 0);

  listRef.emitChildAdded('foo');
  t.equal(nameRefs.foo.listeners('value').length, 1);
  t.equal(nameRefs.bar.listeners('value').length, 0);

  listRef.once('value', value => {
    t.deepEqual(value, [{ name: 'foo' }]);
  });
  nameRefs.foo.emitValue('foo');

  listRef.emitChildAdded('bar');
  t.equal(nameRefs.foo.listeners('value').length, 1);
  t.equal(nameRefs.bar.listeners('value').length, 1);

  listRef.once('value', value => {
    t.deepEqual(value, [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }]);
  });
  nameRefs.bar.emitValue('bar');

  listRef.once('value', value => {
    t.deepEqual(value, [{ name: 'bar', id: 'bar' }]);
  });
  listRef.emitChildRemoved('foo');
  t.equal(nameRefs.foo.listeners('value').length, 0);
  t.equal(nameRefs.bar.listeners('value').length, 1);

  listRef.once('value', value => {
    t.deepEqual(value, []);
  });
  listRef.emitChildRemoved('bar');
  t.equal(nameRefs.foo.listeners('value').length, 0);
  t.equal(nameRefs.bar.listeners('value').length, 0);

  t.end();
});

test('FirebaseList instant', t => {
  t.plan(11);

  const listRef = new RefMock();
  const nameRefs = {};
  nameRefs.foo = new RefMock();
  nameRefs.bar = new RefMock();

  const list = new FirebaseList(listRef, key => ({
    name: nameRefs[key],
  }), 'id', true);

  let step = 1;

  list.on('value', value => {
    if (step === 1) {
      t.deepEqual(value, [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }]);
      step = 2;
    } else if (step === 2) {
      t.deepEqual(value, [{ name: 'bar', id: 'bar' }]);
      step = 3;
    } else if (step === 3) {
      t.deepEqual(value, []);
      step = 4;
    }
  });

  t.equal(list.listeners('value').length, 1);
  t.equal(listRef.listeners('child_added').length, 0);
  t.equal(listRef.listeners('child_removed').length, 0);
  t.equal(listRef.listeners('value').length, 1);
  t.equal(nameRefs.foo.listeners('value').length, 0);
  t.equal(nameRefs.bar.listeners('value').length, 0);

  listRef.emitValue({
    foo: true,
    bar: true,
  });

  t.equal(nameRefs.foo.listeners('value').length, 1);
  t.equal(nameRefs.bar.listeners('value').length, 1);

  nameRefs.foo.emitValue('foo');
  nameRefs.bar.emitValue('bar');

  listRef.emitValue({
    bar: true,
  });

  listRef.emitValue({});
});
