import benchmark, { Event } from 'benchmark';
import { execSync } from 'node:child_process';

new benchmark.Suite()
  .add('tsc -b', () => {
    execSync('yarn tsc -b ./src/tsconfig.benchmark.json --force');
  })
  .add('tsc-ls -b', () => {
    execSync('yarn node dist/bin.js -b ./src/tsconfig.benchmark.json --force');
  })
  .on('cycle', (event: Event) => {
    console.log(String(event.target));
  })
  .run();
