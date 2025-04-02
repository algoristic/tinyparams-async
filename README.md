# @algoristic/tinyparams-async

> [`rxjs`](https://www.npmjs.com/package/rxjs) wrapper for [`@algoristic/tinyparams`](https://www.npmjs.com/package/@algoristic/tinyparams).

## Installation

```sh
npm i @algoristic/tinyparams-async
```

## Usage

```ts
import { params } from '@algoristic/tinyparams-async';
```

### Observe single params

```ts
params('foo')
  .observe()
  .subscribe((value) => {
    console.log(`foo=${foo}`);
  });

params('foo')
  .observe()
  .pipe(pairwise(), startWith(undefined))
  .subscribe(([prev, curr]) => {
    console.log(`previous=${prev}, current=${curr}`);
  });
```

#### Observe all params

```ts
params.observe().subscribe((snapshot) => {
  console.log(snapshot.entries());
});
```
