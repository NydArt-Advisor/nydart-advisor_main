const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

const EXCLUDED_DIRS = ['node_modules', '.next', '.git', 'dist', 'build'];
const LOGS_DIR = path.join(__dirname, 'logs');

function getUsedPorts() {
  try {
    const stdout = execSync(`lsof -i -P -n | grep LISTEN`).toString();
    const ports = new Set();
    stdout.split('\n').forEach(line => {
      const match = line.match(/:(\d+)\s\(LISTEN\)/);
      if (match) ports.add(parseInt(match[1], 10));
    });
    return Array.from(ports);
  } catch (err) {
    return [];
  }
}

function findPackageJsonDir(baseDir, depth = 0) {
  if (depth > 3) return null;
  const entries = fs.readdirSync(baseDir, { withFileTypes: true });

  for (const entry of entries) {
    if (EXCLUDED_DIRS.includes(entry.name)) continue;
    const fullPath = path.join(baseDir, entry.name);

    if (entry.isFile() && entry.name === 'package.json') {
      const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      if (pkg.scripts && pkg.scripts.dev) {
        return baseDir;
      }
    }

    if (entry.isDirectory()) {
      const result = findPackageJsonDir(fullPath, depth + 1);
      if (result) return result;
    }
  }

  return null;
}

// 1. Snapshot des ports avant lancement
const portsBefore = getUsedPorts();

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

const root = __dirname;
const subDirs = fs.readdirSync(root).filter(name => {
  const fullPath = path.join(root, name);
  return fs.statSync(fullPath).isDirectory() && !EXCLUDED_DIRS.includes(name);
});

const services = [];

for (const dir of subDirs) {
  const fullPath = path.join(root, dir);
  const packageDir = findPackageJsonDir(fullPath);
  if (packageDir) {
    services.push({ name: dir, path: packageDir });
  }
}

if (services.length === 0) {
  console.log("❌ Aucun microservice avec script 'dev' trouvé.");
  process.exit(1);
}

console.log(`🚀 Lancement de ${services.length} services...\n`);

services.forEach(service => {
  const logPath = path.join(LOGS_DIR, `${service.name}.log`);
  const outStream = fs.createWriteStream(logPath, { flags: 'a' });

  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: service.path,
    shell: true
  });

  devProcess.stdout.pipe(outStream);
  devProcess.stderr.pipe(outStream);

  devProcess.stdout.on('data', data => {
    process.stdout.write(`[${service.name}] ${data}`);
  });

  devProcess.stderr.on('data', data => {
    process.stderr.write(`[${service.name}] ${data}`);
  });

  devProcess.on('close', code => {
    console.log(`[${service.name}] arrêté avec le code ${code}`);
  });
});

// ⏱️ Attendre un peu que les serveurs montent (3s)
setTimeout(() => {
  const portsAfter = getUsedPorts();
  const newPorts = portsAfter.filter(p => !portsBefore.includes(p));

  console.log(`\n✅ Services démarrés :\n`);
  services.forEach((service, i) => {
    const port = newPorts[i] || '(non détecté)';
    const url = typeof port === 'number' ? `http://localhost:${port}` : port;
    console.log(`- ${service.name.padEnd(20)} : ${url}`);
  });

  console.log(`\n📁 Logs disponibles dans le dossier ./logs`);
}, 3000);