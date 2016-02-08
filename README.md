# kebakaran

high level utilities for firebase interaction

## FirebaseStruct

```js
import Firebase from 'firebase';
import { FirebaseStruct } from 'kebakaran';

const struct = new FirebaseStruct(key => ({
  name: new Firebase(`.../users/${key}/name`),
  isOnline: new Firebase(`.../presence/${key}`),
}), '1');

struct.on('value', value => {
  // value === { name: ... , isOnline: ... }
});
```

## FirebaseList

```js
import Firebase from 'firebase';
import { FirebaseList } from 'kebakaran';

const list = new FirebaseList(new Firebase('.../top-users'), key => ({
  name: new Firebase(`.../users/${key}/name`),
  isOnline: new Firebase(`.../presence/${key}`),
}));

list.on('value', value => {
  // value === [ { id: ... , name: ... , isOnline: ... } ]
});
```

## FirebaseStream
```js
import Firebase from 'firebase';
import { put } from 'redux-saga';
import { FirebaseStream, FirebaseList } from 'kebakaran';

export default function* topUsersSaga() {

  const list = new FirebaseList(new Firebase('.../top-users'), key => ({
    name: new Firebase(`.../users/${key}/name`),
    isOnline: new Firebase(`.../presence/${key}`),
  }));

  const stream = new FirebaseStream(list);

  try {
    while (true) {
      const users = yield stream.next();
      yield put({
        type: 'TOP_USERS',
        users
      });
    }
  } finally {
    stream.close();
    list.close();
  }
}
```
