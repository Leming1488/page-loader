// @flow
import urlApi from 'url';
import fs from 'mz/fs';
import axios from 'axios';
import path from 'path';

export default (url, directory = './', callback) => {
  const parsedUrl = urlApi.parse(url);
  const fileName = `${parsedUrl.hostname}${parsedUrl.pathname}`.replace(/[^A-Za-z0-9]/g, '-');
  const filePath = path.format({
    dir: directory,
    name: fileName,
    ext: '.html',
  });
  fs.stat(directory)
  .then(stats => (stats.isDirectory ? axios.get(url) : new Error('Directory does not exist')))
    .then(res => {
      // console.log(res.data);
      return fs.writeFile(filePath, res.data, 'utf8');
    })
    .then(() => callback('succesfully written'))
  .catch(e => e);
};

