'use strict';

const path = require('path');
const coffee = require('coffee');
const assert = require('assert');

describe('hexo project test', () => {
  const myBin = require.resolve('../bin/yuque-hexo');
  const cwd = path.join(__dirname, 'hexo-project');

  describe('global options', () => {
    it('yuque-hexo --help', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ '--help' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('Usage: yuque-hexo <command>'));
      assert(code === 0);
    });

    it('yuque-hexo clean with warning', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'clean' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('yuque-hexo clean done!'));
      assert(stdout.includes('WARNING'));
      assert(code === 0);
    });

    it('yuque-hexo without cache', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'sync' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('download article body'));
      assert(stdout.includes('yuque-hexo sync done!'));
      assert(code === 0);
    });

    it('yuque-hexo sync use cache', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'sync' ], { cwd })
        .end();
      console.log(stdout);
      assert(!stdout.includes('download article body'));
      assert(stdout.includes('yuque-hexo sync done!'));
      assert(code === 0);
    });

    it('yuque-hexo clean', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'clean' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('yuque-hexo clean done!'));
      assert(!stdout.includes('WARNING'));
      assert(code === 0);
    });
  });
});


describe('markdown project test', () => {
  const myBin = require.resolve('../bin/yuque-hexo');
  const cwd = path.join(__dirname, 'markdown-project');

  describe('global options', () => {
    it('yuque-hexo --help', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ '--help' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('Usage: yuque-hexo <command>'));
      assert(code === 0);
    });

    it('yuque-hexo clean with warning', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'clean' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('yuque-hexo clean done!'));
      assert(stdout.includes('WARNING'));
      assert(code === 0);
    });

    it('yuque-hexo without cache', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'sync' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('download article body'));
      assert(stdout.includes('yuque-hexo sync done!'));
      assert(code === 0);
    });

    it('yuque-hexo sync use cache', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'sync' ], { cwd })
        .end();
      console.log(stdout);
      assert(!stdout.includes('download article body'));
      assert(stdout.includes('yuque-hexo sync done!'));
      assert(code === 0);
    });

    it('yuque-hexo clean', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'clean' ], { cwd })
        .end();
      console.log(stdout);
      assert(stdout.includes('yuque-hexo clean done!'));
      assert(!stdout.includes('WARNING'));
      assert(code === 0);
    });
  });
});
