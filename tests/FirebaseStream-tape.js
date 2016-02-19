import test from 'tape';
import sagaMiddleware from 'redux-saga';
import { cps, call } from 'redux-saga/effects';
import { applyMiddleware, createStore } from 'redux';

import RefMock from './RefMock';
import { FirebaseStream, sagaCbEqual } from '../src/index';

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

test('FirebaseStream equal', t => {
  t.plan(2);

  const ref = new RefMock();
  const stream = new FirebaseStream(ref, sagaCbEqual);

  function* saga() {
    t.deepEqual(yield stream.next(), []);
    yield call(() => new Promise(resolve => setTimeout(resolve, 1)));
    t.deepEqual(yield stream.next(), [1]);
    t.end();
  }

  applyMiddleware(sagaMiddleware(saga))(createStore)(() => null);

  ref.emitValue([]);
  setTimeout(() => ref.emitValue([]), 50);
  setTimeout(() => ref.emitValue([1]), 100);
});
