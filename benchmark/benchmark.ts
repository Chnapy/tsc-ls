import benchmark, { Event } from 'benchmark';
import { execSync } from 'child_process';

new benchmark.Suite()
  .add('tsc', () => {
    execSync('yarn tsc -b ./src/tsconfig.benchmark.json --force');
  })
  .add('tsc-ls', () => {
    execSync('yarn node dist/bin.js -b ./src/tsconfig.benchmark.json --force');
  })
  .on('cycle', (event: Event) => {
    console.log(String(event.target));
  })
  .run();
