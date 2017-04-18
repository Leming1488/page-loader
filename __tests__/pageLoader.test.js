// @flow

import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import nock from 'nock';
import pageLoader from '../src';

const host = 'https://localhost';

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

test('Download page from url to a current directory', () => {
  return pageLoader('https://api.github.com/users/codeheaven-io', __dirname)
    .then(state => expect(state).toBe(true));
});
