import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('====================================================');
console.log('🚀 Starting Water Can Delivery System (MERN Stack)');
console.log('⚡ Unified Single-Port Application');
console.log('====================================================');

// Build Frontend
console.log('📦 Preparing React Frontend build...');
try {
  execSync(`${npmCmd} run build`, {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
  });
  console.log('✅ Frontend built successfully');
} catch (err) {
  console.warn('⚠️ Frontend build warning:', err.message);
}

// Start Unified Express + MongoDB Server
console.log('\n🚀 Starting Unified Backend & Frontend Server...');
const backendPath = path.join(__dirname, 'backend');
const backendProcess = spawn(npmCmd, ['start'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
});

console.log('\n====================================================');
console.log('🎉 Water Can Delivery is running on a SINGLE URL:');
console.log('👉 http://localhost:8080');
console.log('====================================================\n');

// Clean exit on termination
const cleanup = () => {
  console.log('\n🛑 Shutting down server...');
  try { backendProcess.kill(); } catch (e) {}
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
