import fsReaddirR from 'recursive-readdir';

export default path => (
  new Promise((resolve, reject) => {
    try {
      fsReaddirR(path, (err, files) => (err ? reject(err) : resolve(files)));
    } catch (err) {
      reject(err);
    }
  })
);
