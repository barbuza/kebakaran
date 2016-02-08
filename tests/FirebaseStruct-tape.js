import test from 'tape';

import RefMock from './RefMock';
import { FirebaseStruct } from '../src';

function setup() {
  const nameRef = new RefMock();
  const countRef = new RefMock();
  const struct = new FirebaseStruct(() => ({
    name: nameRef,
    count: countRef,
  }));
  return { nameRef, countRef, struct };
}

test('FirebaseStruct close', t => {
  t.plan(6);

  const { nameRef, countRef, struct } = setup();

  struct.on('value', () => null);

  t.equal(struct.listeners('value').length, 1);
  t.equal(nameRef.listeners('value').length, 1);
  t.equal(countRef.listeners('value').length, 1);

  struct.close();

  t.equal(struct.listeners('value').length, 0);
  t.equal(nameRef.listeners('value').length, 0);
  t.equal(countRef.listeners('value').length, 0);
});

test('FirebaseStruct basics', t => {
  t.plan(3);

  const { nameRef, countRef, struct } = setup();

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 1,
    });
  });

  nameRef.emitValue('foo');
  countRef.emitValue(1);

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 2,
    });
  });

  countRef.emitValue(2);

  struct.on('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 2,
    });
  });
});
