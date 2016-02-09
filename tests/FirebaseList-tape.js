import test from 'tape';

import RefMock from './RefMock';
import { FirebaseList } from '../src/index';

test('FirebaseList', t => {
  t.plan(15);

  const listRef = new RefMock();
  const nameRefs = {};
  nameRefs.foo = new RefMock();
  nameRefs.bar = new RefMock();

  const list = new FirebaseList(listRef, key => ({
    name: nameRefs[key],
  }));

  let step = 1;
  list.on('value', value => {
    switch (step) {
      case 1:
        t.deepEqual(value, [], '1: empty intial emit');
        break;
      case 2:
        t.deepEqual(value, [{ id: 'foo', name: 'foo' }],
          '6: list emits value on first child data');
        break;
      case 3:
        t.deepEqual(value, [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }],
          '9: list emits second child');
        break;
      case 4:
        t.deepEqual(value, [{ name: 'bar', id: 'bar' }],
          '10: list emits only second child after first one removed');
        break;
      case 5:
        t.deepEqual(value, [], '13: list emits empty value after second child removed');
        break;
      default:
        /* istanbul ignore next */
        t.fail();
    }
    step++;
  });

  t.equal(nameRefs.foo.listeners('value').length, 0, '2: no initial listeners on first child');
  t.equal(nameRefs.bar.listeners('value').length, 0, '3: no initial listeners on second child');

  listRef.emitChildAdded('foo');
  t.equal(nameRefs.foo.listeners('value').length, 1, '4: list subscribes to ref on child added');
  t.equal(nameRefs.bar.listeners('value').length, 0, '5: other refs have no listeners');

  nameRefs.foo.emitValue('foo');

  listRef.emitChildAdded('bar');
  t.equal(nameRefs.foo.listeners('value').length, 1, '7: one listener on first child');
  t.equal(nameRefs.bar.listeners('value').length, 1, '8: one listener on second child');

  nameRefs.bar.emitValue('bar');

  listRef.emitChildRemoved('foo');

  t.equal(nameRefs.foo.listeners('value').length, 0, '11: no listeners on first child');
  t.equal(nameRefs.bar.listeners('value').length, 1, '12: one listener on second child');

  listRef.emitChildRemoved('bar');

  t.equal(nameRefs.foo.listeners('value').length, 0, '14: no listeners on first child');
  t.equal(nameRefs.bar.listeners('value').length, 0, '15: no listeners on second child');

  t.end();
});

test('FirebaseList instant', t => {
  t.plan(7);

  const listRef = new RefMock();
  const nameRefs = {};
  nameRefs.foo = new RefMock();
  nameRefs.bar = new RefMock();

  const list = new FirebaseList(listRef, key => ({
    name: nameRefs[key],
  }), 'id', true);

  let step = 1;
  list.on('value', value => {
    switch (step) {
      case 1:
        t.deepEqual(value, [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }]);
        break;
      case 2:
        t.deepEqual(value, [{ name: 'bar', id: 'bar' }]);
        break;
      case 3:
        t.deepEqual(value, []);
        break;
      default:
        /* istanbul ignore next */
        t.fail();
    }
    step++;
  });

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

test('FirebaseList listeners', t => {
  const listRef = new RefMock();
  const list = new FirebaseList(listRef, () => null, 'id', false);

  t.equal(listRef.listeners('child_added').length, 1);
  t.equal(listRef.listeners('child_removed').length, 1);
  t.equal(listRef.listeners('value').length, 0);

  list.close();

  t.equal(listRef.listeners('child_added').length, 0);
  t.equal(listRef.listeners('child_removed').length, 0);
  t.equal(listRef.listeners('value').length, 0);

  t.end();
});

test('FirebaseList instant listeners', t => {
  const listRef = new RefMock();
  const list = new FirebaseList(listRef, () => null, 'id', true);

  t.equal(listRef.listeners('child_added').length, 0);
  t.equal(listRef.listeners('child_removed').length, 0);
  t.equal(listRef.listeners('value').length, 1);

  list.close();

  t.equal(listRef.listeners('child_added').length, 0);
  t.equal(listRef.listeners('child_removed').length, 0);
  t.equal(listRef.listeners('value').length, 0);

  t.end();
});

test('FirebaseList close', t => {
  const listRef = new RefMock();
  const nameRef = new RefMock();
  const list = new FirebaseList(listRef, () => ({ name: nameRef }));

  listRef.emitChildAdded('foo');

  t.equal(nameRef.listeners('value').length, 1);

  list.close();

  t.equal(nameRef.listeners('value').length, 0);

  t.end();
});
