import { params } from './observable-params';

const useHashToggles = [false, true];

const standardRoutingUrls = [
  'http://localhost/path/of/my/app',
  'http://localhost/path/of/my/app#heading-1',
  'http://localhost/path/of/my/app?foo=bar',
  'http://localhost/path/of/my/app?foo=bar&answer=42&debug=true',
  'http://localhost/path/of/my/app?foo=bar&answer=42&debug=true#heading-1',
];
const hashRoutingUrls = [
  'http://localhost/',
  'http://localhost/#?foo=bar',
  'http://localhost/#/path/of/my/app',
  'http://localhost/#/path/of/my/app?foo=bar',
  'http://localhost/#/path/of/my/app?foo=bar&answer=42&debug=true',
];

for (const useHash of useHashToggles) {
  const urls = useHash ? hashRoutingUrls : standardRoutingUrls;

  describe(useHash ? 'hash routing' : 'standard routing', () => {
    beforeAll(() => {
      params.useHash = useHash;
    });

    for (const url of urls) {
      describe(`url: ${url}`, () => {
        beforeEach(() => {
          Object.defineProperty(window, 'location', {
            value: new URL(url),
            writable: true,
          });
        });

        describe('on single parameters', () => {
          it('observe correct amount of changes emitted', () => {
            const firstCallback = jest.fn();
            const secondCallback = jest.fn();

            params('foo').observe().subscribe(firstCallback);
            expect(firstCallback).toHaveBeenCalledTimes(1);
            if (url.includes('foo')) {
              expect(firstCallback).toHaveBeenCalledWith('bar');
            } else {
              expect(firstCallback).toHaveBeenCalledWith(undefined);
            }

            params('foo').setValue('baz');
            expect(firstCallback).toHaveBeenLastCalledWith('baz');
            expect(firstCallback).toHaveBeenCalledTimes(2);

            Object.defineProperty(window, 'location', {
              value: new URL(
                useHash
                  ? 'http://localhost/#/?foo=baz'
                  : 'http://localhost/?foo=baz',
              ),
            });

            params('foo').observe().subscribe(secondCallback);
            expect(secondCallback).toHaveBeenCalledTimes(1);
            expect(secondCallback).toHaveBeenCalledWith('baz');

            expect(firstCallback.mock.invocationCallOrder[0]).toBeLessThan(
              secondCallback.mock.invocationCallOrder[0],
            );

            params('foo').remove();

            expect(firstCallback).toHaveBeenLastCalledWith(undefined);
            expect(firstCallback).toHaveBeenCalledTimes(3);

            expect(secondCallback).toHaveBeenLastCalledWith(undefined);
            expect(secondCallback).toHaveBeenCalledTimes(2);
          });

          it('observe emitted modifications', (done) => {
            let testStage:
              | 'initial value'
              | 'removed value'
              | 'modified value' = 'initial value';
            const initialValue = params('foo').getValue();

            params('foo')
              .observe()
              .subscribe((observableValue) => {
                if (testStage === 'initial value') {
                  expect(observableValue).toBe(initialValue);

                  if (url.includes('foo')) {
                    expect(observableValue).toBe('bar');
                  } else {
                    expect(observableValue).toBeUndefined();
                  }
                  return;
                }

                if (testStage === 'removed value') {
                  expect(observableValue).toBeUndefined();
                  return;
                }

                if (testStage === 'modified value') {
                  expect(observableValue).toBe('baz');
                  done();
                  return;
                }

                done.fail();
              });

            testStage = 'removed value';
            params('foo').remove();

            testStage = 'modified value';
            params('foo').setValue('baz');
          });
        });

        describe('on multiple parameters', () => {
          it('observe emitted modifications', (done) => {
            let testStage:
              | 'initial values'
              | 'modified values'
              | 'final values' = 'initial values';
            const { setMany, setAll } = params.modifiers();

            params.observe().subscribe(({ get }) => {
              const foo = get('foo');
              const debug = get('debug');
              const noop = get('noop');

              if (testStage === 'initial values') {
                if (url.includes('foo')) {
                  expect(foo).toBe('bar');
                } else {
                  expect(foo).toBeUndefined();
                }

                if (url.includes('debug')) {
                  expect(debug).toBe('true');
                } else {
                  expect(debug).toBeUndefined();
                }

                expect(noop).toBeUndefined();
                return;
              }

              if (testStage === 'modified values') {
                expect(foo).toBe('baz');
                expect(debug).toBe('false');
                expect(noop).toBeUndefined();
                return;
              }

              if (testStage === 'final values') {
                expect(foo).toBeUndefined();
                expect(debug).toBeUndefined();
                expect(noop).toBe('nonce');
                done();
              }

              done.fail();
            });

            testStage = 'modified values';
            setMany({ foo: 'baz', debug: false });

            testStage = 'final values';
            setAll({ noop: 'nonce' });
          });
        });
      });
    }
  });
}
