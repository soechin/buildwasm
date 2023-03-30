import child_process from 'child_process';
import path from 'path';
import url from 'url';

async function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

async function spawnExec(cmd, args) {
  const proc = child_process.spawn(cmd, args);
  proc.stderr.on('data', (chunk) => process.stderr.write(chunk));
  proc.stdout.on('data', (chunk) => process.stdout.write(chunk));

  const code = await new Promise((resolve, reject) => {
    proc.on('error', (err) => reject(err));
    proc.on('close', (code) => resolve(code));
  });

  if (code != 0) {
    process.exit(code);
  }
}

const root = path.dirname(url.fileURLToPath(import.meta.url));
const run = ['run', '-v', `${root}:/src`, '--rm', 'emscripten/emsdk'];

await spawnExec('docker', [...run, 'emcmake', 'cmake', '/src/libpng-1.6.39',
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
