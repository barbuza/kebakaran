import test from 'tape';
import raf from 'raf';

import RefMock from './RefMock';
import { FirebaseList, FirebaseStream } from '../src';

test('FirebaseList+FirebaseStream', t => {
  const nameRefs = {
    foo: new RefMock(),
    bar: new RefMock(),
  };
  const listRef = new RefMock();
  const list = new FirebaseList(listRef, key => ({ name: nameRefs[key] }));
  const stream = new FirebaseStream(list);

  raf(() => {
    t.end();
  });

  (async () => {
    listRef.emitChildAdded('foo');
    nameRefs.foo.emitValue('foo');

    t.deepEqual(await stream.nextPromise(), [{ name: 'foo', id: 'foo' }]);

    listRef.emitChildAdded('bar');
    nameRefs.bar.emitValue('bar');

    t.deepEqual(
      await stream.nextPromise(),
      [{ name: 'foo', id: 'foo' }, { name: 'bar', id: 'bar' }]
    );

    await stream.nextPromise();
    t.fail();
  })();
});
