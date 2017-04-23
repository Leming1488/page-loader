// @flow
import urlApi from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
import debug from './lib/debug';
import getFileNameFromUrl from './lib/getFileNameFromUrl';

export default (url, directory = './') => {
  const parsedUrl = urlApi.parse(url);
  const fileName = getFileNameFromUrl(parsedUrl.hostname, parsedUrl.pathname);
  const assetsDir = `${fileName}_files`;
  const nodeList = [
    { selector: 'img[src]', attr: 'src' },
    { selector: 'script[src]', attr: 'src' },
    { selector: 'link[href]', attr: 'href' },
  ];
  const filePath = path.format({
    dir: directory,
    name: fileName,
    ext: '.html',
  });

  return fs.stat(directory)
  .then((stats) => {
    if (stats.isDirectory) {
      return fs.mkdir(path.join(directory, assetsDir));
    }
    return Promise.reject(new Error(`Directory ${directory} does not exist`));
  })
  .then(() => axios.get(url))
  .then((res) => {
    const $ = cheerio.load(res.data);
    const links = nodeList.reduce((acc, node) => {
      const src = $(node.selector).map((index, item) => {
        const attr = $(item).attr(node.attr);
        $(item).attr(node.attr, path.join(assetsDir, path.basename(attr)));
        return attr;
      });
      return [...acc, ...src.get()];
    }, []);
    const htmlFile = fs.writeFile(filePath, $.html(), 'utf8');
    debug(links);
    const assetsData = links.map(link => axios({ method: 'get', url: urlApi.resolve(url, link), responseType: 'arraybuffer' }));
    return Promise.all(assetsData, htmlFile);
  })
  .then(responses => (
      responses.map(res => (
        { url: res.request.path, loaded: fs.writeFile(path.join(directory, assetsDir, path.basename(res.request.path)), res.data, 'utf8') }
  ))));
};

