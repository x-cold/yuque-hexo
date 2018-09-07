'use strict';

const path = require('path');
const coffee = require('coffee');
const assert = require('assert');

describe('test/hexo-project.test.js', () => {
  const myBin = require.resolve('../bin/yuque-hexo');
  const cwd = path.join(__dirname, 'hexo-project');

  describe('global options', () => {
    it('yuque-hexo --help', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ '--help' ], { cwd })
        .end();
      assert(stdout.includes('Usage: yuque-hexo <command>'));
      assert(code === 0);
    });

    it('yuque-hexo clean with warning', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'clean' ], { cwd })
        .end();
      assert(stdout.includes('yuque-hexo clean start.'));
      assert(stdout.includes('yuque-hexo clean finished.'));
      assert(stdout.includes('WARNING'));
      assert(code === 0);
    });

    it('yuque-hexo without cache', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'sync' ], { cwd })
        .end();
      assert(stdout.includes('yuque-hexo sync start.'));
      assert(stdout.includes('download article body'));
      assert(stdout.includes('yuque-hexo sync finished.'));
      assert(code === 0);
    });

    it('yuque-hexo sync use cache', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'sync' ], { cwd })
        .end();
      assert(stdout.includes('yuque-hexo sync start.'));
      assert(!stdout.includes('download article body'));
      assert(stdout.includes('yuque-hexo sync finished.'));
      assert(code === 0);
    });

    it('yuque-hexo clean', async () => {
      const { stdout, code } = await coffee
        .fork(myBin, [ 'clean' ], { cwd })
        .end();
      assert(stdout.includes('yuque-hexo clean start.'));
      assert(stdout.includes('yuque-hexo clean finished.'));
      assert(!stdout.includes('WARNING'));
      assert(code === 0);
    });
  });
});
