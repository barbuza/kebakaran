# kebakaran [![Build Status](https://travis-ci.org/barbuza/kebakaran.svg?branch=master)](https://travis-ci.org/barbuza/kebakaran) [![Coverage Status](https://coveralls.io/repos/github/barbuza/kebakaran/badge.svg?branch=master)](https://coveralls.io/github/barbuza/kebakaran?branch=master) [![npm version](https://badge.fury.io/js/kebakaran.svg)](https://badge.fury.io/js/kebakaran)

high level utilities for firebase interaction

## FirebaseStruct

```js
import Firebase from 'firebase';
import { FirebaseStruct } from 'kebakaran';

const userId = 'foo';

const struct = new FirebaseStruct({
  name: new Firebase(`.../users/${userId}/name`),
  isOnline: new Firebase(`.../presence/${userId}`),
});

struct.on('value', value => {
  // value === { name: ... , isOnline: ... }
});
```

## FirebaseList

```js
import Firebase from 'firebase';
import { FirebaseList, FirebaseStruct } from 'kebakaran';

const list = new FirebaseList(new Firebase('.../top-users'), key => new FirebaseStruct({
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
import { FirebaseStream, FirebaseList, FirebaseStruct } from 'kebakaran';

export default function* topUsersSaga() {

  const list = new FirebaseList(new Firebase('.../top-users'), key => new FirebaseStruct({
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
