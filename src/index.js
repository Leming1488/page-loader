// @flow
import urlApi from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
import fileNameFromUrl from './lib/fileNameFromUrl';

export default (url, directory = './') => {
  const mkdirExist = dir => fs.existsSync(dir) || fs.mkdirSync(dir);
  const parsedUrl = urlApi.parse(url);
  const fileName = fileNameFromUrl(parsedUrl.hostname, parsedUrl.pathname);
  const assetsDir = `${fileName}_files`;
  let assetsLinkList = [];

  const nodeList = [
    { selector: 'img', attr: 'src' },
    { selector: 'script', attr: 'src' },
    { selector: 'link', attr: 'href' },
  ];
  const filePath = path.format({
    dir: directory,
    name: fileName,
    ext: '.html',
  });

  return fs.stat(directory)
  .then(stats => (stats.isDirectory ? axios.get(url) : new Error('Directory does not exist')))
  .then((res) => {
    const $ = cheerio.load(res.data);
    nodeList.forEach((node) => {
      $(node.selector).each((index, item) => {
        assetsLinkList = [...assetsLinkList, path.basename($(item).attr(node.attr))];
        $(item).attr(node.attr, path.join(assetsDir, path.basename($(item).attr(node.attr))));
      });
    });
    mkdirExist(path.join(directory, assetsDir));
    const requestList = assetsLinkList.map(link => (
      axios({ method: 'get', url: `${url}/${assetsDir}/${link}`, responseType: 'arraybuffer' })
      .then(response => fs.writeFile(path.join(directory, assetsDir, link), response.data, 'utf8'))
    ));
    return Promise.all(requestList, fs.writeFile(filePath, $.html(), 'utf8'));
  })
  .then(() => 'succesfully written');
};

