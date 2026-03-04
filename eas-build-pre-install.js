const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

const serverDeps = [
  'express', 'pg', 'drizzle-orm', 'drizzle-zod',
  'tsx', 'ws', 'http-proxy-middleware',
  '@octokit/rest', '@replit/connectors-sdk',
  '@stardazed/streams-text-encoding', '@ungap/structured-clone',
  'zod-validation-error'
];

const serverDevDeps = [
  '@types/express', 'drizzle-kit', '@expo/ngrok',
  'babel-plugin-react-compiler'
];

serverDeps.forEach(dep => {
  if (pkg.dependencies[dep]) {
    delete pkg.dependencies[dep];
    console.log('Removed dependency:', dep);
  }
});

serverDevDeps.forEach(dep => {
  if (pkg.devDependencies[dep]) {
    delete pkg.devDependencies[dep];
    console.log('Removed devDependency:', dep);
  }
});

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
console.log('package.json cleaned for EAS build');
