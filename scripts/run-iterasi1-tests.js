const { spawnSync } = require('child_process');
const path = require('path');

const testFiles = [
  'tests/iterasi1-pengajuan-penelitian.test.js',
  'tests/iterasi1-pengajuan-surat-pindah.test.js',
  'tests/iterasi1-pengajuan-akta-kelahiran.test.js',
  'tests/iterasi1-pengajuan-kartu-keluarga.test.js',
  'tests/iterasi1-pengajuan-surat-kerja.test.js',
  'tests/iterasi1-pengajuan-surat-tanah.test.js',
  'tests/iterasi1-pengajuan-surat-ahli-waris.test.js',
  'tests/iterasi1-pengajuan-surat-yayasan.test.js',
  'tests/iterasi2-auth.test.js',
  'tests/iterasi3-upload-dokumen.test.js'
];

const jestBin = path.join(__dirname, '..', 'node_modules', 'jest', 'bin', 'jest.js');

let hasFailure = false;

for (const testFile of testFiles) {
  console.log('\n==================================================');
  console.log(`Menjalankan test: ${testFile}`);
  console.log('==================================================\n');

  const result = spawnSync(
    process.execPath,
    [jestBin, testFile, '--runInBand', '--verbose'],
    {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..')
    }
  );

  if (result.status !== 0) {
    hasFailure = true;
    break;
  }
}

process.exit(hasFailure ? 1 : 0);
