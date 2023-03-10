import * as x from '../src';

describe('Compose operator', () => {
  it('Calls all operators', async () => {
    const instance = x.initialize();
    const mockOperator = jest.fn(() => instance);

    x.compose(mockOperator, mockOperator, mockOperator);

    expect(mockOperator).toBeCalledTimes(3);
  });

  it('Pipes all values', async () => {
    const mockOperator1 = jest.fn(() => {
      const instance = x.initialize();
      instance.options = { cache: 'default' };
      return instance;
    });

    const mockOperator2 = jest.fn((i?: x.XShieldRequest) => {
      const instance = x.initialize(i);
      instance.url = '/testing';
      return instance;
    });

    const mockOperator3 = jest.fn((i?: x.XShieldRequest) => {
      const instance = x.initialize(i);
      instance.options = { cache: 'no-cache' };
      return instance;
    });

    const xshield = x.compose(mockOperator1, mockOperator2, mockOperator3);

    expect(xshield()).toHaveProperty(['url'], '/testing');
    expect(xshield()).toHaveProperty(['options', 'cache'], 'no-cache');
  });

  it('Immutability and Composability work', async () => {
    const api = x.compose(
      x.url('https://catfact.ninja'),
      x.headers({ Accept: 'application/json' }),
      x.headers({ 'Content-Type': 'application/text' }),
    );

    const breedsApi = x.compose(
      api,
      x.url('/breeds'),
      x.headers({ 'Content-Type': 'application/json' }),
    );

    const factsApi = x.compose(
      api,
      x.url('/facts'),
      x.headers({ 'Accept-Language': 'en-US,en;q=0.5' }),
    );

    // breeds
    expect(breedsApi()).toHaveProperty(['url'], 'https://catfact.ninja/breeds');
    expect(breedsApi().headers.get('Accept')).toBe('application/json');
    expect(breedsApi().headers.get('Content-Type')).toBe('application/json');
    // fatcs
    expect(factsApi()).toHaveProperty(['url'], 'https://catfact.ninja/facts');
    expect(factsApi().headers.get('Accept')).toBe('application/json');
    expect(factsApi().headers.get('Content-Type')).toBe('application/text');
    expect(factsApi().headers.get('Accept-Language')).toBe('en-US,en;q=0.5');
  });
});
