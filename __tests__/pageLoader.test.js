// @flow
import fs from 'mz/fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import rimraf from 'rimraf';
import axiosHttpAdapter from '../src/lib/aixosHttpAdapter';
import pageLoader from '../src';

const host = 'https://localhost';
axiosHttpAdapter(host);
const address = `${host}${path.sep}index`;
const defaultDir = path.resolve('./localhost-index.html');

const testPage =
`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Test page</title>
    <script src="/assets/js/index.js"></script>
    <script src="/assets/js/vendor/jquery.js"></script>
    <link href="/assets/css/index.css" rel="stylesheet"/>
  </head>
  <body>
    <h1 class="text-center">Download</h1>
    <img alt="img1" src="/assets/img/logo-background-1.jpg"/>
    <img alt="img2" src="/assets/img/logo-background-2.jpg"/>
    <img alt="img3" src="/assets/img/logo-background-3.jpg"/>
    <a  href="#"><img alt="photo" src="/assets/img/icon-photo.png"/></a>
    <p>You are probably looking for either jsdom , jquery or cheerio. <img alt="warning" src="/assets/img/icon-warning.png"/>  What you are doing is called screen scraping, extracting data from a site. jsdom/jquery offer complete set of tools but cheerio is much faster </p>
  </body>
</html>
`;


describe('page-loader', () => {
  const tmpDir = fs.mkdtempSync(`${os.tmpdir()}${path.sep}`);
  const page = fs.readFileSync(path.resolve('./__tests__/__fixtures__/', 'test-page.html'));

  const assetsPath = './__tests__/__fixtures__/assets/';
  const ner = fs.readdir(assetsPath)
    .then(nodes => Promise.all(nodes.reduce((acc, dir) => [...acc, fs.readdir(assetsPath + dir)], [])))
    .then((list) => {
      console.log(list.join(','));
    });

  beforeEach(() => {
    nock(host)
      .get('/index')
      .reply(200, page);
  });

  afterAll(() => {
    rimraf(tmpDir, () => console.log('clear tmpDir'));
    rimraf(defaultDir, () => console.log('clear defaultDir'));
  });

  test('Download page from url to a current directory', (done) => {
    function callback() {
      fs.readFile(`${tmpDir}${path.sep}localhost-index.html`, 'utf8')
      .then((data) => {
        expect(data).toBe(testPage);
        done();
      })
      .catch((e) => {
        done.fail(e);
      });
    }
    pageLoader(address, tmpDir, callback);
  });

  test('Download page from url to a directory by default', (done) => {
    function callback() {
      fs.readFile(defaultDir, 'utf8')
      .then((data) => {
        expect(data).toBe(testPage);
        done();
      })
      .catch((e) => {
        done.fail(e);
      });
    }
    pageLoader(address, undefined, callback);
  });

  test('Download assets', (done) => {
    function callback() {
      fs.readdir(assetsPath)
      .then(nodes => Promise.all(nodes.reduce((acc, dir) => [...acc, fs.readdir(`${assetsPath}${dir}`)], [])))
      .then((list) => {
        expect(list.join(',')).toBe(' ');
        done();
      })
      .catch((e) => {
        done.fail(e);
      });
    }
    pageLoader(address, tmpDir, callback);
  });
});

