/*
Copyright (C) 2019 The Trustees of Indiana University
SPDX-License-Identifier: BSD-3-Clause
*/
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
