import test from 'tape';
import sagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';

import RefMock from './RefMock';
import { list, stream, struct } from '../src/index';

test('FirebaseList+FirebaseStream', t => {
  t.plan(3);

  const nameRefs = {
    foo: new RefMock(),
    bar: new RefMock(),
  };
  const listRef = new RefMock();

  const nameStream = stream(list(
    listRef,
    key => struct({ name: nameRefs[key] }),
    { instant: false }
  ));

  function* saga() {
    t.deepEqual(yield nameStream.next(), []);

    listRef.emitChildAdded('foo');
    nameRefs.foo.emitValue('foo');

    t.deepEqual(yield nameStream.next(), [{ name: 'foo', id: 'foo' }]);

    listRef.emitChildAdded('bar');
    nameRefs.bar.emitValue('bar');

    t.deepEqual(
      yield nameStream.next(),
      [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }]
    );

    t.end();
  }

  applyMiddleware(sagaMiddleware(saga))(createStore)(() => null);
});
