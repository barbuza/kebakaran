import test from 'tape';
import raf from 'raf';
import { call } from 'redux-saga';

import RefMock from './RefMock';
import { FirebaseStream } from '../src/index';

test('FirebaseStream next', t => {
  const ref = new RefMock();
  const stream = new FirebaseStream(ref);

  t.deepEqual(stream.next(), call([stream, stream.nextPromise]));
  t.end();
});

test('FirebaseStream close', t => {
  t.plan(2);

  const ref = new RefMock();
  const stream = new FirebaseStream(ref);

  t.equal(ref.listeners('value').length, 1);

  stream.close();

  t.equal(ref.listeners('value').length, 0);
});

test('FirebaseStream skip', t => {
  const ref = new RefMock();
  const stream = new FirebaseStream(ref);

  raf(() => {
    t.end();
  });

  (async () => {
    t.equal(await stream.nextPromise(), 1);
    t.equal(await stream.nextPromise(), 3);
    await stream.nextPromise();
    /* istanbul ignore next */
    t.fail();
  })();

  ref.emitValue(1);
  ref.emitValue(2);
  ref.emitValue(3);
});

test('FirebaseStream reverse', t => {
  t.plan(1);

  const ref = new RefMock();
  const stream = new FirebaseStream(ref);

  raf(() => {
    t.end();
  });

  (async () => {
    t.equal(await stream.nextPromise(), 1);
    await stream.nextPromise();
    /* istanbul ignore next */
    t.fail();
  })();

  ref.emitValue(1);
  ref.emitValue(2);
  ref.emitValue(1);
});
