const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Only run in development mode
if (process.env.NODE_ENV === 'production') {
  console.log('Source maps are disabled in production mode');
  process.exit(0);
}

// Check for the existence of CSS files and return the found path
function findCssFile(baseName, possiblePaths) {
  for (const possiblePath of possiblePaths) {
    const fullPath = path.resolve(__dirname, possiblePath, baseName);
    if (fs.existsSync(fullPath)) {
      console.log(`Found CSS file: ${fullPath}`);
      return fullPath;
    }
  }
  console.warn(`Could not find CSS file ${baseName} in any of the provided paths`);
  return null;
}

// Define the single path for CSS files
const frontendCssFile = findCssFile(
  'product-estimator-frontend-bundled.css', 
  ['public/css']
);

const adminCssFile = findCssFile(
  'product-estimator-admin-bundled.css', 
  ['public/css']
);

// Only add files that exist
const files = [];

if (frontendCssFile) {
  files.push({
    css: frontendCssFile,
    map: 'product-estimator-frontend-bundled.css.map',
    sourcesRoot: 'src/styles/frontend',
    sourceFile: 'src/styles/frontend/Index.scss'
  });
}

if (adminCssFile) {
  files.push({
    css: adminCssFile,
    map: 'product-estimator-admin-bundled.css.map',
    sourcesRoot: 'src/styles/admin',
    sourceFile: 'src/styles/admin/Index.scss'
  });
}

// Find all SCSS files
function findScssFiles(sourcesRoot) {
  return glob.sync(`${sourcesRoot}/**/*.scss`).map(file => {
    // Make the path relative to the root
    return file;
  });
}

// Make directories if they don't exist
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
    console.log(`Created directory: ${dirname}`);
  }
}

// Generate source map files
files.forEach(file => {
  try {
    // Make sure the CSS file exists
    if (!fs.existsSync(file.css)) {
      console.warn(`Warning: CSS file ${file.css} does not exist. Skipping...`);
      return;
    }
    
    const mapPath = path.resolve(path.dirname(file.css), file.map);
    ensureDirectoryExists(mapPath);
    
    // Find all SCSS files for this CSS file
    const sourceFiles = findScssFiles(file.sourcesRoot);
    
    // Create source map content with all SCSS files
    const sourceMapContent = JSON.stringify({
      version: 3,
      file: path.basename(file.css),
      sources: [file.sourceFile, ...sourceFiles],
      sourceRoot: '',
      names: [],
      mappings: ''
    }, null, 2);
    
    // Write source map file
    fs.writeFileSync(mapPath, sourceMapContent);
    console.log(`Created source map: ${mapPath} with ${sourceFiles.length + 1} SCSS files`);
    
    // Add sourceMappingURL to CSS file
    const cssContent = fs.readFileSync(file.css, 'utf8');
    // Remove any existing sourceMappingURL
    const cleanCssContent = cssContent.replace(/\/\*#\s*sourceMappingURL=.*\*\//, '');
    const updatedCssContent = cleanCssContent + `\n/*# sourceMappingURL=${file.map} */`;
    
    // Write updated CSS file
    fs.writeFileSync(file.css, updatedCssContent);
    console.log(`Updated CSS file: ${file.css}`);
  } catch (error) {
    console.error(`Error processing ${file.css}: ${error.message}`);
  }
});

console.log('Source maps added successfully!');