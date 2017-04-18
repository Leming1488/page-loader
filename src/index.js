// @flow
import urlApi from 'url';
import fs from 'mz/fs';
import axios from 'axios';

export default (url, path = __dirname) => {
  const parsedUrl = urlApi.parse(url);
  const fileName = `${parsedUrl.hostname}${parsedUrl.pathname}`.replace(/[^A-Za-z0-9]/g, '-');
  return fs.stat(path)
    .then(stats => (stats.isDirectory ? axios.get(url) : console.log('is not directory')))
    .then(res => fs.writeFile(`${path}/${fileName}.html`, `${res.data}`, 'utf8'))
    .then(() => Promise.resolve(true))
    .catch(e => console.log(e));
};

