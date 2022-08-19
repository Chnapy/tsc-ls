window.BENCHMARK_DATA = {
  "lastUpdate": 1660950440991,
  "repoUrl": "https://github.com/Chnapy/tsc-ls",
  "entries": {
    "Benchmark.js Benchmark": [
      {
        "commit": {
          "author": {
            "name": "Chnapy",
            "username": "Chnapy"
          },
          "committer": {
            "name": "Chnapy",
            "username": "Chnapy"
          },
          "id": "49e560e38b88eac9c4721deb90fd71acd8ccc02b",
          "message": "Add benchmarks",
          "timestamp": "2022-08-16T08:05:42Z",
          "url": "https://github.com/Chnapy/tsc-ls/pull/5/commits/49e560e38b88eac9c4721deb90fd71acd8ccc02b"
        },
        "date": 1660948891475,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "tsc",
            "value": 0.16,
            "range": "±9.25%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "tsc-ls",
            "value": 0.15,
            "range": "±1.58%",
            "unit": "ops/sec",
            "extra": "5 samples"
          }
        ]
      }
    ],
    "\"tsc -b\" vs \"tsc-ls -b\" no-plugins Benchmark": [
      {
        "commit": {
          "author": {
            "email": "richardhaddad@hotmail.fr",
            "name": "Richard Haddad",
            "username": "Chnapy"
          },
          "committer": {
            "email": "richardhaddad@hotmail.fr",
            "name": "Richard Haddad",
            "username": "Chnapy"
          },
          "distinct": true,
          "id": "0be0511e192ea23a32cf648233e1d8574601b8be",
          "message": "fix benchmark yaml",
          "timestamp": "2022-08-19T22:59:15Z",
          "tree_id": "6e60b8046c3f82f7d0cbf20c3b01e43d0d562f10",
          "url": "https://github.com/Chnapy/tsc-ls/commit/0be0511e192ea23a32cf648233e1d8574601b8be"
        },
        "date": 1660950074115,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "tsc -b",
            "value": 0.22,
            "range": "±8.37%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "tsc-ls -b",
            "value": 0.2,
            "range": "±0.86%",
            "unit": "ops/sec",
            "extra": "5 samples"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "richardhaddad@hotmail.fr",
            "name": "Richard Haddad",
            "username": "Chnapy"
          },
          "committer": {
            "email": "richardhaddad@hotmail.fr",
            "name": "Richard Haddad",
            "username": "Chnapy"
          },
          "distinct": true,
          "id": "0be0511e192ea23a32cf648233e1d8574601b8be",
          "message": "fix benchmark yaml",
          "timestamp": "2022-08-19T22:59:15Z",
          "tree_id": "6e60b8046c3f82f7d0cbf20c3b01e43d0d562f10",
          "url": "https://github.com/Chnapy/tsc-ls/commit/0be0511e192ea23a32cf648233e1d8574601b8be"
        },
        "date": 1660950439182,
        "tool": "benchmarkjs",
        "benches": [
          {
            "name": "tsc -b",
            "value": 0.17,
            "range": "±1.10%",
            "unit": "ops/sec",
            "extra": "5 samples"
          },
          {
            "name": "tsc-ls -b",
            "value": 0.16,
            "range": "±2.10%",
            "unit": "ops/sec",
            "extra": "5 samples"
          }
        ]
      }
    ]
  }
}