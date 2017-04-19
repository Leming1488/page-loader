// @flow
import urlApi from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';

export default (url, directory = './') => {
  const parsedUrl = urlApi.parse(url);
  const fileName = `${parsedUrl.hostname}${parsedUrl.pathname}`.replace(/[^A-Za-z0-9]/g, '-');
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
          assetsLinkList = [...assetsLinkList, $(item).attr(node.attr)];
          $(item).attr(node.attr, path.join(assetsDir, path.basename($(item).attr(node.attr))));
        });
      });
      console.log(assetsLinkList);
      const requestList = assetsLinkList.map(link => axios.get(`${url}${link}`));
      Promise.all()
      return fs.writeFile(filePath, $.html(), 'utf8');
    })
    .then(() => 'succesfully written');
};

