// @flow
import fs from 'mz/fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import rimraf from 'rimraf';
import url from 'url';
import axios from '../src/lib/axios';
import pageLoader from '../src';

const host = 'https://localhost';
const address = url.resolve(host, 'test');
const addressErrorHttp = url.resolve(host, 'errorHttp');
const testDir = './__tests__/__fixtures__/';
const assetsPath = 'localhost-test_files';
const assetsPathTest = 'assets';
const cssPath = 'index.css';
const jsPath = 'index.js';
const imgPath = 'image.jpg';

const testPage =
`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test page</title>
    <script src="${path.join(assetsPath, jsPath)}"></script>
    <link href="${path.join(assetsPath, cssPath)}" rel="stylesheet">
  </head>
  <body>
    <h1 class="text-center">Download</h1>
    <a href="#"><img alt="photo" src="${path.join(assetsPath, imgPath)}"></a>
  </body>
</html>
`;


describe('page-loader', () => {
  const getAssets = name => fs.readFileSync(path.resolve(testDir, assetsPathTest, name));
  let tmpDir;
  let page;

  beforeAll(() => {
    axios(host);
    tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    page = fs.readFileSync(path.resolve(testDir, 'test-page.html'));
  });

  beforeEach(() => {
    nock(host)
      .get('/test')
      .reply(200, page)
      .get(`/${assetsPathTest}/${cssPath}`)
      .reply(200, getAssets(cssPath))
      .get(`/${assetsPathTest}/${jsPath}`)
      .reply(200, getAssets(jsPath))
      .get(`/${assetsPathTest}/${imgPath}`)
      .reply(200, getAssets(imgPath))
      .get('/errorHttp')
      .reply(500);
  });

  afterAll(() => {
    rimraf(tmpDir, () => console.log('clear tmpDir'));
  });

  test('Test wrong http response', (done) => {
    pageLoader(addressErrorHttp, tmpDir)
      .then(() => done.fail())
      .catch(e => done(e));
  });

  test('Test fs error', (done) => {
    pageLoader(addressErrorHttp, null)
      .then(() => done.fail())
      .catch(e => done(e));
  });

  test('Test bad url', () => {
    expect(() => {
      pageLoader(null, tmpDir);
    }).toThrow();
  });

  test('Download page from url to a current directory', (done) => {
    pageLoader(address, tmpDir)
    .then(rezult => expect(rezult).toBe(`Succesfully written in ${tmpDir}`))
    .then(() => fs.readdir(path.join(tmpDir, assetsPath), 'utf8'))
    .then((data) => {
      expect(data.join('')).toBe(fs.readdirSync(path.join(testDir, assetsPathTest)).join(''));
    })
    .then(() => fs.readFile(path.join(tmpDir, 'localhost-test.html'), 'utf8'))
    .then((data) => {
      expect(data).toBe(testPage);
      done();
    })
    .catch(done.fail);
  });
});
