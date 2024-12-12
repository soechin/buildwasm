import { spawnExec, askQuestion } from './common.js';
import path from 'path';
import url from 'url';

const root = path.dirname(url.fileURLToPath(import.meta.url));
const run = ['run', '-v', `${root}:/src`, '--rm', 'emscripten/emsdk'];

await spawnExec('docker', [...run, 'emcmake', 'cmake', '/src/libtiff-v4.7.0',
  '-B', 'build/libtiff',
  '-DCMAKE_BUILD_TYPE=Release',
  '-DCMAKE_INSTALL_PREFIX=/src/dist/libtiff',
  '-DBUILD_SHARED_LIBS=OFF',
  '-Dzlib=ON',
  '-DZLIB_INCLUDE_DIR=/src/dist/zlib/include',
  '-DZLIB_LIBRARY=/src/dist/zlib/lib/libz.a',
  '-Djpeg=ON',
  '-DJPEG_INCLUDE_DIR=/src/dist/libjpeg/include',
  '-DJPEG_LIBRARY=/src/dist/libjpeg/lib/libjpeg.a',
  '-Dtiff-docs=OFF',
  '-Dtiff-contrib=OFF',
  '-Dtiff-tests=OFF',
  '-Dtiff-tools=OFF',
  '-L',
]);

const answer = await askQuestion('Continue? [Y/n] ');
if (answer != '' && answer != 'Y' && answer != 'y') {
  process.exit(0);
}

await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/libtiff']);
await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/libtiff', 'install']);
