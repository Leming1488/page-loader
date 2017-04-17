// @flow

import nock from 'nock';
import pageLoader from '../src';

const url = 'https://hexlet.io/courses';
test('Download page from url to a current directory', () => {
  pageLoader('https://api.github.com/users/codeheaven-io', __dirname)
    .then(state => expect(state).toBe('true'));
});
