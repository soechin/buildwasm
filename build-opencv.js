import child_process from 'child_process';
import path from 'path';
import url from 'url';
import readline from 'readline';

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

await spawnExec('docker', [...run, 'emcmake', 'cmake', '/src/opencv-4.7.0',
  '-B', 'build/opencv',
  '-DCMAKE_BUILD_TYPE=Release',
  '-DCMAKE_INSTALL_PREFIX=/src/dist/opencv',
  "-DBUILD_SHARED_LIBS=OFF",
  '-DZLIB_INCLUDE_DIR=/src/dist/zlib/include',
  '-DZLIB_LIBRARY=/src/dist/zlib/lib/libz.a',
  '-DJPEG_INCLUDE_DIR=/src/dist/libjpeg/include',
  '-DJPEG_LIBRARY=/src/dist/libjpeg/lib/libjpeg.a',
  '-DPNG_PNG_INCLUDE_DIR=/src/dist/libpng/include/libpng16',
  '-DPNG_LIBRARY=/src/dist/libpng/lib/libpng16.a',
  '-DTIFF_INCLUDE_DIR=/src/dist/libtiff/include',
  '-DTIFF_LIBRARY=/src/dist/libtiff/lib/libtiff.a',
  "-DCPU_BASELINE=''",
  "-DCPU_DISPATCH=''",
  "-DCV_ENABLE_INTRINSICS=OFF",
  "-DCV_TRACE=OFF",
  "-DWITH_IPP=OFF",
  "-DWITH_ITT=OFF",
  "-DWITH_JASPER=OFF",
  "-DWITH_OPENCL=OFF",
  "-DWITH_OPENJPEG=OFF",
  "-DWITH_PROTOBUF=OFF",
  "-DWITH_PTHREADS_PF=OFF",
  "-DWITH_QUIRC=OFF",
  "-DWITH_WEBP=OFF",
  "-DBUILD_opencv_apps=OFF",
  "-DBUILD_opencv_dnn=OFF",
  "-DBUILD_opencv_highgui=OFF",
  "-DBUILD_opencv_gapi=OFF",
  "-DBUILD_opencv_ts=OFF",
  "-DBUILD_opencv_video=OFF",
  "-DBUILD_opencv_videoio=OFF",
  '-L',
]);

const answer = await askQuestion('Continue? [Y/n] ');
if (answer != '' && answer != 'Y' && answer != 'y') {
  process.exit(0);
}

await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/opencv']);
await spawnExec('docker', [...run, 'emmake', 'make', '-C', 'build/opencv', 'install']);
