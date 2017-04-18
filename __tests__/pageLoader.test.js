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
const testDir = fs.mkdtempSync(`${path.resolve(__dirname, './__fixture__/')}${path.sep}`);

const testPage =
`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Test page</title>
<body>
  <h1>Test</h1>
</body>
</html>`;

axios.defaults.host = host;
axios.defaults.adapter = httpAdapter;

beforeEach(() => {
  nock(host)
    .get('/index')
    .reply(200, testPage);
});

afterAll(() => {
  rimraf(tmpDir, () => console.log('clear tmpDir'));
  rimraf(testDir, () => console.log('clear testDir'));
});

test('Download page from url to a current directory', () => {
  console.log(tmpDir);
  return Promise.resolve(pageLoader(address, tmpDir))
    .then(() => fs.readFile(`${tmpDir}${path.sep}localhost-index.html`, 'utf8'))
    .then(date => expect(date).toBe(testPage));
});

test('Download page from url to a directory by default', () => {
  console.log(testDir);
  return Promise.resolve(pageLoader(address, testDir))
    .then(() => fs.readFile(`${testDir}${path.sep}localhost-index.html`, 'utf8'))
    .then(date => expect(date).toBe(testPage));
});
