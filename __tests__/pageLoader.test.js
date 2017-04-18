// @flow
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import fs from 'mz/fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import rimraf from 'rimraf';
import pageLoader from '../src';

const host = 'https://localhost';
const address = `${host}${path.sep}index`;
const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
const page = fs.readFileSync(path.resolve('./__tests__/__fixtures__/', 'test-page.html'));
const defaultDir = path.resolve('./localhost-index.html');

const testPage =
`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test page</title>
  </head>
  <body>
    <h1>Test</h1>
  </body>
</html>
`;

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

describe('page-loader', () => {
  beforeEach(() => {
    nock(host)
      .get('/index')
      .reply(200, page);
  });

  afterAll(() => {
    rimraf(tmpDir, () => console.log('clear tmpDir'));
    rimraf(defaultDir, () => console.log('clear defaultDir'));
  });

  test('Download page from url to a current directory', () => (
    Promise.resolve(pageLoader(address, tmpDir))
    .then(() => fs.readFile(`${tmpDir}${path.sep}localhost-index.html`, 'utf8'))
    .then(date => expect(date).toBe(testPage))
  ));

  test('Download page from url to a directory by default', () => (
    Promise.resolve(pageLoader(address))
    .then(() => fs.readFile(defaultDir, 'utf8'))
    .then(date => expect(date).toBe(testPage))
  ));
});

