// @flow
import fs from 'mz/fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import rimraf from 'rimraf';
import url from 'url';
// import fsReaddirR from '../src/lib/fs-readdir-r';
import axiosHttpAdapter from '../src/lib/aixosHttpAdapter';
import pageLoader from '../src';

const host = 'https://localhost';
axiosHttpAdapter(host);
const address = url.resolve(host, 'test');
const defaultDir = path.resolve('./localhost-test.html');
const testDir = './__tests__/__fixtures__/';
const assetsPath = 'localhost-test_files/';
const assetsPathTest = 'assets/';
const cssPath = 'index.css';
const jsPath = 'index.js';
const imgPath = 'icon-warning.png';

const testPage =
`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test page</title>
    <script src="${assetsPath}${jsPath}"></script>
    <link href="${assetsPath}${cssPath}" rel="stylesheet">
  </head>
  <body>
    <h1 class="text-center">Download</h1>
    <a href="#"><img alt="photo" src="${assetsPath}${imgPath}"></a>
  </body>
</html>
`;


describe('page-loader', () => {
  const getAssets = name => fs.readFileSync(path.resolve(testDir, assetsPathTest, name));
  let tmpDir;
  let page;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
    page = fs.readFileSync(path.resolve(testDir, 'test-page.html'));
  });

  beforeEach(() => {
    nock(host)
      .get('/test')
      .reply(200, page)
      .get(`/test/${assetsPathTest}/${cssPath}`)
      .reply(200, getAssets(cssPath))
      .get(`/test/${assetsPathTest}/${jsPath}`)
      .reply(200, getAssets(jsPath))
      .get(`/test/${assetsPathTest}/${imgPath}`)
      .reply(200, getAssets(imgPath));
  });

  afterAll(() => {
    rimraf(tmpDir, () => console.log('clear tmpDir'));
    rimraf(defaultDir, () => console.log('clear defaultDir'));
  });

  test('Download page from url to a current directory', (done) => {
    pageLoader(address, tmpDir)
      .then(() => fs.readFile(path.join(tmpDir, 'localhost-test.html'), 'utf8'))
      .then((data) => {
        expect(data).toBe(testPage);
        done();
      })
      .catch(done.fail);
  });

  test('Download page from url to a directory by default', (done) => {
    pageLoader(address)
      .then(() => fs.readFile(defaultDir, 'utf8'))
      .then((data) => {
        expect(data).toBe(testPage);
        done();
      })
      .catch(done.fail);
  });

  // test('Download assets', (done) => {
  //   function callback() {
  //     fsReaddirR(assetsPath)
  //       .then((files) => {
  //         const list = files.reduce((acc, file) => [...acc, path.basename(file)], []).join(',');
  //         expect(list).toBe('index.css');
  //         done();
  //       })
  //     .catch((e) => {
  //       done.fail(e);
  //     });
  //   }
  //   pageLoader(address, tmpDir, callback);
  // });
});

