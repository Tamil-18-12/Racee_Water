import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('====================================================');
console.log('🚀 Starting Water Can Delivery System (Dev Mode)');
console.log('📡 Backend API : http://localhost:8080');
console.log('⚡ Frontend Dev : http://localhost:5173');
console.log('====================================================\n');

// Start Backend
const backendProcess = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Start Frontend
const frontendProcess = spawn(npmCmd, ['--prefix', 'frontend', 'run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// Clean termination
const cleanup = () => {
  console.log('\n🛑 Shutting down development servers...');
  try { backendProcess.kill(); } catch (e) {}
  try { frontendProcess.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
