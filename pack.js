import child_process from 'child_process';
import path from 'path';
import url from 'url';

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

await spawnExec('docker', [...run, 'npm', 'pack']);
