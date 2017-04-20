 import path from 'path';

 export default (...arg) => path.join(arg.join('')).replace(/[^A-Za-z0-9]/g, '-');
