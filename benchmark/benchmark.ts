#!/usr/bin/env ts-node

import Benchmark, { Suite } from 'benchmark';
import { execSync } from 'node:child_process';

/**
 * Run benchmark comparing `tsc -b` vs `tsc-ls -b`.
 * Log diff in %.
 *
 * `yarn build` should be done before this process.
 */

const runBenchmark = (): void => {
  const suite = new Suite()
    .add('tsc -b', () => {
      execSync('yarn tsc -b ./src/tsconfig.benchmark.json --force');
    })
    .add('tsc-ls -b', () => {
      execSync(
        'yarn node dist/bin.js -b ./src/tsconfig.benchmark.json --force'
      );
    })
    .run();

  const benchmarks: Benchmark[] = suite.slice(0, suite.length);
  const tscBench = benchmarks[0];
  const tscLsBench = benchmarks[1];

  const rmeMax = Math.max(tscBench.stats.rme, tscLsBench.stats.rme);

  // if uncertainty of measurement is >10%, re-run benchmark
  if (rmeMax > 10) {
    return runBenchmark();
  }

  /* eslint-disable no-mixed-operators */
  const diffPercent = Math.max(100 - (tscLsBench.hz * 100) / tscBench.hz, 0);

  const name = 'performance impact %: "tsc-ls -b" vs "tsc -b"';
  const value = diffPercent.toFixed(2);
  const unit = '%';
  const pm = '\u00B1';
  const rme = rmeMax.toFixed(2);
  const size = tscBench.stats.sample.length + tscLsBench.stats.sample.length;

  console.log(`${name} x ${value} ${unit} ${pm}${rme}% (${size} runs sampled)`);
};

runBenchmark();
