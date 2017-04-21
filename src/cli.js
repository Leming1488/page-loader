import app from 'commander';
import chalk from 'chalk';
import Listr from 'listr';
import pageLoader from './';

export default () => {
  app
    .version('0.0.3')
    .arguments('<url>')
    .description('Download page to a current directory')
    .option('-o, --output [dir]', 'Output directory')
    .action((url) => {
      try {
        const tasks = new Listr([
          {
            title: 'Upload Page',
            /*eslint-disable */
            task: (ctx) => pageLoader(url, app.output).then(res => (ctx.res = res)),
            /*eslint-enable */
          },
        ]);
        return tasks.run()
          .then((ctx) => {
            console.log(chalk.green.bold(ctx.res));
            process.exit(0);
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
