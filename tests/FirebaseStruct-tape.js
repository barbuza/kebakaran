import test from 'tape';
import asap from 'asap';

import RefMock from './RefMock';
import { FirebaseStruct } from '../src/index';

function setup(mapValue = value => value) {
  const nameRef = new RefMock();
  const countRef = new RefMock();
  const struct = new FirebaseStruct({
    name: nameRef,
    count: countRef,
  }, mapValue);
  return { nameRef, countRef, struct };
}

test('FirebaseStruct close', t => {
  const { nameRef, countRef, struct } = setup();

  struct.on('value', () => null);
  struct.on('value', () => null);

  t.equal(struct.listeners('value').length, 2);
  t.equal(nameRef.listeners('value').length, 1);
  t.equal(countRef.listeners('value').length, 1);

  struct.off('value');

  t.equal(struct.listeners('value').length, 0);
  t.equal(nameRef.listeners('value').length, 0);
  t.equal(countRef.listeners('value').length, 0);

  struct.on('value', () => null);

  t.equal(struct.listeners('value').length, 1);
  t.equal(nameRef.listeners('value').length, 1);
  t.equal(countRef.listeners('value').length, 1);

  t.end();
});

test('FirebaseStruct once', t => {
  const { nameRef, countRef, struct } = setup();

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 1,
    });

    asap(() => {
      t.equal(nameRef.listeners('value').length, 0);
      t.equal(countRef.listeners('value').length, 0);
      t.equal(struct.listeners('value').length, 0);

      t.end();
    });
  });

  t.equal(nameRef.listeners('value').length, 1);
  t.equal(countRef.listeners('value').length, 1);
  t.equal(struct.listeners('value').length, 1);

  nameRef.emitValue('foo');
  countRef.emitValue(1);
});

test('FirebaseStruct basics', t => {
  t.plan(4);

  const { nameRef, countRef, struct } = setup();

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 1,
    });
  });

  nameRef.emitValue('foo');
  countRef.emitValue(1);

  countRef.emitValue(2);

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 2,
    });
  });

  struct.on('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 2,
    });
  });

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: 2,
    });
  });
});

test('FirebaseStruct mapValue', t => {
  t.plan(4);

  const { nameRef, countRef, struct } = setup(({ name, count }) => ({ name, count: -count }));

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: -1,
    });
  });

  nameRef.emitValue('foo');
  countRef.emitValue(1);

  countRef.emitValue(2);

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: -2,
    });
  });

  struct.on('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: -2,
    });
  });

  struct.once('value', value => {
    t.deepEqual(value, {
      name: 'foo',
      count: -2,
    });
  });
});
