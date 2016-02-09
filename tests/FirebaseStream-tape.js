import test from 'tape';
import sagaMiddleware, { cps, call } from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';

import RefMock from './RefMock';
import { FirebaseStream } from '../src/index';

test('FirebaseStream next', t => {
  const ref = new RefMock();
  const stream = new FirebaseStream(ref);

  t.deepEqual(stream.next(), cps(stream.callback));
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

test('FirebaseStream loose', t => {
  t.plan(2);

  const ref = new RefMock();
  const stream = new FirebaseStream(ref);

  function* saga() {
    t.equal(yield stream.next(), 1);
    yield call(() => new Promise(resolve => setTimeout(resolve, 1)));
    t.equal(yield stream.next(), 3);
    t.end();
  }

  applyMiddleware(sagaMiddleware(saga))(createStore)(() => null);

  ref.emitValue(1);
  ref.emitValue(2);
  ref.emitValue(3);
});

test('FirebaseStream strict', t => {
  t.plan(3);

  const ref = new RefMock();
  const stream = new FirebaseStream(ref, false);

  function* saga() {
    t.equal(yield stream.next(), 1);
    yield call(() => new Promise(resolve => setTimeout(resolve, 1)));
    t.equal(yield stream.next(), 2);
    yield call(() => new Promise(resolve => setTimeout(resolve, 1)));
    t.equal(yield stream.next(), 3);
    t.end();
  }

  applyMiddleware(sagaMiddleware(saga))(createStore)(() => null);

  ref.emitValue(1);
  ref.emitValue(2);
  ref.emitValue(3);
});
