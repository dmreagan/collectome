describe('apiHost', () => {
  let apiHost;

  beforeEach(module('apiHost'));

  beforeEach(inject((_apiHost_) => {
    apiHost = _apiHost_;
  }));

  it('should return the api host', () => {
    expect(apiHost).toBeDefined();
  });
});
