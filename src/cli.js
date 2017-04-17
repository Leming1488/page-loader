import app from 'commander';

export default () => {
  app
    .version('0.0.1')
    .arguments('<url>')
    .description('Download page to a current directory')
    .option('-o, --output [dir]', 'Output directory')
    .action((url) => {
      console.log(`${url} ${app.output}`);
    })
    .parse(process.argv);
};
