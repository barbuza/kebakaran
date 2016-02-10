import test from 'tape';
import sagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';

import RefMock from './RefMock';
import { FirebaseList, FirebaseStream, FirebaseStruct } from '../src/index';

test('FirebaseList+FirebaseStream', t => {
  t.plan(3);

  const nameRefs = {
    foo: new RefMock(),
    bar: new RefMock(),
  };
  const listRef = new RefMock();

  const list = new FirebaseList(
    listRef,
    key => new FirebaseStruct({ name: nameRefs[key] }),
    { instant: false }
  );
  const stream = new FirebaseStream(list);

  function* saga() {
    t.deepEqual(yield stream.next(), []);

    listRef.emitChildAdded('foo');
    nameRefs.foo.emitValue('foo');

    t.deepEqual(yield stream.next(), [{ name: 'foo', id: 'foo' }]);

    listRef.emitChildAdded('bar');
    nameRefs.bar.emitValue('bar');

    t.deepEqual(
      yield stream.next(),
      [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }]
    );

    t.end();
  }

  applyMiddleware(sagaMiddleware(saga))(createStore)(() => null);
});
