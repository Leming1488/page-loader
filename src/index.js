// @flow
import urlApi from 'url';
import fs from 'mz/fs';
import axios from 'axios';
// fs.write(`${parsedUrl.hostname}${parsedUrl.pathname}.html`, res)
export default (url, path) => {
  const parsedUrl = urlApi.parse(url);
  fs.stat(path)
    .then((stats) => {
      if (stats.isDirectory) {
        axios.get('https://travelpayoutsjs.herokuapp.com')
          .then(res => console.log(res))
          .catch(error => {
            console.log(error);
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          });
      }
    })
    .catch(e => console.log(e));
};

