import app from 'commander';
import chalk from 'chalk';
import pageLoader from './';

export default () => {
  app
    .version('0.0.3')
    .arguments('<url>')
    .description('Download page to a current directory')
    .option('-o, --output [dir]', 'Output directory')
    .action((url) => {
      try {
        return pageLoader(url, app.output)
          .then((state) => {
            console.log(chalk.green.bold(state));
            return process.exit(0);
          })
          .catch((e) => {
            if (e.response) {
              console.error(chalk.red.bold(`${e.response.status}/n Url: ${e.response.request.path}`));
              return process.exit(1);
            }
            console.error(chalk.yellow.bold(`${e}`));
            return process.exit(1);
          });
      } catch (e) {
        console.error(chalk.red.bold(`Error: ${e.name} ${e.message}`));
        return process.exit(1);
      }
    })
    .parse(process.argv);
};
