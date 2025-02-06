import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = join(__dirname, '..');
const srcDir = join(projectRoot, 'src');

// Debug
console.log('Project root:', projectRoot);
console.log('Checking src directory:', srcDir);

// Essential source file patterns to include
const includePatterns = [
  // Include all files in src directory
  'src',
  
  // Config files
  'package.json',
  'svelte.config.js',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js'
];

const includeExtensions = [
  '.svelte',
  '.ts',
  '.js',
  '.css',
  '.html',
  '.json'
];

// Directories to be excluded from snapshotting
const excludedDirs = ['.svelte-kit', 'node_modules'];

function isAllowedFile(path) {
  // Check if file matches any include pattern
  const matchesPattern = includePatterns.some(pattern => 
    path.includes(pattern) || path === pattern
  );
  // Check if file has allowed extension
  const hasValidExtension = includeExtensions.some(ext => 
    path.endsWith(ext)
  );

  return matchesPattern && hasValidExtension;
}

function getAllFiles(dir, filesArray = []) {
  let items;
  try {
    items = readdirSync(dir);
  } catch (error) {
    console.error('Error reading directory:', dir, error);
    return filesArray;
  }
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = relative(projectRoot, fullPath);
    
    // If the item is a directory and its name is in the excluded list, skip it (and its children)
    if (statSync(fullPath).isDirectory() && excludedDirs.includes(item)) {
      console.log('Skipping excluded directory:', relativePath);
      continue;
    }
    
    if (statSync(fullPath).isDirectory()) {
      // Recursively scan directories
      getAllFiles(fullPath, filesArray);
    } else if (isAllowedFile(relativePath)) {
      // Add matching files
      console.log('Including file:', relativePath); // Debug log
      filesArray.push({
        path: relativePath,
        type: relativePath.startsWith('src/') ? 'source' : 'config',
        content: readFileSync(fullPath, 'utf-8')
      });
    }
  }
  
  return filesArray;
}

function createSnapshot() {
  console.log('Creating project snapshot...');
  
  const files = getAllFiles(projectRoot);
  
  // Sort files by path
  files.sort((a, b) => a.path.localeCompare(b.path));

  // Group by type
  const sourceFiles = files.filter(f => f.type === 'source');
  const configFiles = files.filter(f => f.type === 'config');

  // Create snapshot
  const snapshot = {
    timestamp: new Date().toISOString(),
    files
  };

  // Write to file
  writeFileSync(
    join(projectRoot, 'code-snapshot.txt'),
    JSON.stringify(snapshot, null, 2)
  );

  // Log summary
  console.log('\nSnapshot created with:');
  console.log(`\nSource files (${sourceFiles.length}):`);
  sourceFiles.forEach(f => console.log(`- ${f.path}`));
  console.log(`\nConfig files (${configFiles.length}):`);
  configFiles.forEach(f => console.log(`- ${f.path}`));
  console.log('\nSnapshot saved to code-snapshot.txt');
}

createSnapshot();
