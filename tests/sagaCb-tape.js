/* eslint no-constant-condition: 0 */

import test from 'tape';
import { createStore, applyMiddleware } from 'redux';
import sagaMiddleware from 'redux-saga';
import { cps, call } from 'redux-saga/effects';

import { sagaCbLoose, sagaCbStrict, sagaCbEqual } from '../src/index';

function delay() {
  return new Promise(resolve => {
    setTimeout(resolve, 10);
  });
}

function runSaga(saga) {
  const middleware = sagaMiddleware();
  applyMiddleware(middleware)(createStore)(() => null);
  middleware.run(saga);
}

test('sagaCbStrict', t => {
  const actual = [];
  const { listener, callback } = sagaCbStrict();

  function* saga() {
    while (true) {
      actual.push(yield cps(callback));
      yield call(delay);
    }
  }

  runSaga(saga);

  listener(undefined);
  listener(null);
  listener(1);
  listener(2);
  listener(3);

  setTimeout(() => {
    listener(4);
  }, 50);

  setTimeout(() => {
    listener(5);
  }, 100);

  setTimeout(() => {
    listener(6);
  }, 150);

  setTimeout(() => {
    t.deepEqual(actual, [undefined, null, 1, 2, 3, 4, 5, 6]);
    t.end();
  }, 200);
});

test('sagaCbLoose', t => {
  const actual = [];
  const { listener, callback } = sagaCbLoose();

  function* saga() {
    while (true) {
      actual.push(yield cps(callback));
      yield call(delay);
    }
  }

  runSaga(saga);

  listener(1);
  listener(2);
  listener(2);
  listener(2);
  listener(3);

  setTimeout(() => {
    listener(4);
  }, 50);

  setTimeout(() => {
    listener(5);
  }, 100);

  setTimeout(() => {
    listener(6);
  }, 150);

  setTimeout(() => {
    listener(null);
  }, 200);

  setTimeout(() => {
    listener(undefined);
  }, 250);

  setTimeout(() => {
    t.deepEqual(actual, [1, 3, 4, 5, 6, null, undefined]);
    t.end();
  }, 300);
});

test('sagaCbEqual', t => {
  const actual = [];
  const { listener, callback } = sagaCbEqual();

  function* saga() {
    while (true) {
      actual.push(yield cps(callback));
      yield call(delay);
    }
  }

  runSaga(saga);

  listener(1);
  listener(2);
  listener(2);
  listener(2);
  listener(3);

  setTimeout(() => {
    listener(3);
  }, 50);

  setTimeout(() => {
    listener(3);
  }, 100);

  setTimeout(() => {
    listener(4);
  }, 150);

  setTimeout(() => {
    listener(null);
  }, 200);

  setTimeout(() => {
    listener(null);
  }, 250);

  setTimeout(() => {
    listener(undefined);
  }, 300);

  setTimeout(() => {
    listener(undefined);
  }, 350);

  setTimeout(() => {
    t.deepEqual(actual, [3, 4, null, undefined]);
    t.end();
  }, 400);
});
