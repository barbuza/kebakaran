import test from 'tape';
import Firebase from 'firebase';

import { FirebaseList } from '../src';

test.skip('Firebase', t => {
  t.plan(2);

  const list = new FirebaseList(new Firebase('https://kebakaran-test.firebaseio.com/list'), key => ({
    name: new Firebase(`https://kebakaran-test.firebaseio.com/names/${key}`),
    count: new Firebase(`https://kebakaran-test.firebaseio.com/counts/${key}`),
  }));

  let step = 1;

  list.on('value', value => {
    if (step === 1) {
      t.deepEqual(value, []);
      step = 2;
    } else {
      t.deepEqual(value, [
        {
          id: '1',
          name: 'foo',
          count: 10,
        },
        {
          id: '2',
          name: 'bar',
          count: 20,
        },
      ]);

      list.close();
      t.end();
    }
  });
});
