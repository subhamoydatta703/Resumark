const { spawn } = require('node:child_process');

const child = spawn(process.env.ComSpec, ['/d', '/s', '/c', 'bunx expo run:android'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    JAVA_HOME: 'C:\\Program Files\\Java\\jdk-21',
    ANDROID_HOME: 'C:\\Users\\User\\AppData\\Local\\Android\\Sdk',
    ANDROID_SDK_ROOT: 'C:\\Users\\User\\AppData\\Local\\Android\\Sdk',
  },
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
