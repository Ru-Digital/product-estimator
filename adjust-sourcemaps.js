const fs = require('fs');
const path = require('path');

const frontendMapPath = './public/css/product-estimator-frontend-bundled.css.map';
const adminMapPath = './public/css/product-estimator-admin-bundled.css.map';

// Process a source map file to adjust paths
function processMap(mapPath) {
  console.log(`Processing ${mapPath}...`);
  
  try {
    // Read the source map
    const sourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
    
    // Update the sourceRoot to point to the project root
    sourceMap.sourceRoot = '/wp-content/plugins/product-estimator/';
    
    // Write back the updated source map
    fs.writeFileSync(mapPath, JSON.stringify(sourceMap, null, 2));
    console.log(`Updated ${mapPath} with absolute sourceRoot`);
  } catch (error) {
    console.error(`Error processing ${mapPath}: ${error.message}`);
  }
}

// Process both map files
processMap(frontendMapPath);
processMap(adminMapPath);

console.log('Source maps adjusted\!');
