import { spawnExec, askQuestion } from './common.js';
import path from 'path';
import url from 'url';

const root = path.dirname(url.fileURLToPath(import.meta.url));
const run = ['run', '-v', `${root}:/src`, '--rm', 'emscripten/emsdk'];

await spawnExec('docker', [...run, 'emcmake', 'cmake', '/src/libpng-1.6.44',
  '-B', 'build/libpng',
  '-DCMAKE_BUILD_TYPE=Release',
  '-DCMAKE_INSTALL_PREFIX=/src/dist/libpng',
  '-DZLIB_INCLUDE_DIR=/src/dist/zlib/include',
  '-DZLIB_LIBRARY=/src/dist/zlib/lib/libz.a',
  '-DPNG_FRAMEWORK=OFF',
  '-DPNG_HARDWARE_OPTIMIZATIONS=OFF',
  '-DPNG_SHARED=OFF',
  '-DPNG_TESTS=OFF',
  '-L',
]);

const answer = await askQuestion('Continue? [Y/n] ');
if (answer != '' && answer != 'Y' && answer != 'y') {
  process.exit(0);
}

await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/libpng']);
await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/libpng', 'install']);
