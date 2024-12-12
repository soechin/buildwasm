import { spawnExec, askQuestion } from './common.js';
import path from 'path';
import url from 'url';

const root = path.dirname(url.fileURLToPath(import.meta.url));
const run = ['run', '-v', `${root}:/src`, '--rm', 'emscripten/emsdk'];

await spawnExec('docker', [...run, 'emcmake', 'cmake', '/src/zlib-1.3.1',
  '-B', 'build/zlib',
  '-DCMAKE_BUILD_TYPE=Release',
  '-DCMAKE_INSTALL_PREFIX=/src/dist/zlib',
  '-L',
]);

const answer = await askQuestion('Continue? [Y/n] ');
if (answer != '' && answer != 'Y' && answer != 'y') {
  process.exit(0);
}

await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/zlib']);
await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/zlib', 'install']);
