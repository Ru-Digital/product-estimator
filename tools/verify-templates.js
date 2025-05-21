/**
 * Template Verification Script
 * 
 * This script verifies that all templates are correctly registered and can be loaded.
 * It can be run as part of the build process to catch template-related issues early.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const TEMPLATES_DIR = path.resolve(__dirname, '../src/templates');
const TEMPLATE_LOADER_PATH = path.resolve(__dirname, '../src/js/frontend/template-loader.js');
const MANAGERS_DIR = path.resolve(__dirname, '../src/js/frontend/managers');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}Template Verification Tool${colors.reset}`);
console.log('=======================\n');

// Find all HTML templates
const findAllTemplates = () => {
  const templateFiles = glob.sync('**/*.html', { cwd: TEMPLATES_DIR });
  console.log(`${colors.blue}Found ${templateFiles.length} template files in ${TEMPLATES_DIR}${colors.reset}`);
  return templateFiles.map(file => path.join(TEMPLATES_DIR, file));
};

// Read the template-loader.js file to identify registered templates
const findRegisteredTemplates = () => {
  try {
    const loaderContent = fs.readFileSync(TEMPLATE_LOADER_PATH, 'utf8');
    
    // Extract import statements
    const importRegex = /import\s+(\w+)\s+from\s+['"](@templates\/[^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(loaderContent)) !== null) {
      imports.push({
        variable: match[1],
        path: match[2].replace('@templates/', '')
      });
    }
    
    // Extract template registrations
    const templatesMapRegex = /const\s+templates\s*=\s*\{([^}]+)\}/s;
    const templatesMapMatch = templatesMapRegex.exec(loaderContent);
    
    if (!templatesMapMatch) {
      console.error(`${colors.red}Could not find templates map in template-loader.js${colors.reset}`);
      return [];
    }
    
    const templatesMapContent = templatesMapMatch[1];
    const templateEntryRegex = /'([^']+)':\s*(\w+)/g;
    const registeredTemplates = [];
    
    while ((match = templateEntryRegex.exec(templatesMapContent)) !== null) {
      const templateId = match[1];
      const variableName = match[2];
      
      // Find the corresponding import
      const importEntry = imports.find(imp => imp.variable === variableName);
      
      if (importEntry) {
        registeredTemplates.push({
          id: templateId,
          variable: variableName,
          path: importEntry.path
        });
      }
    }
    
    console.log(`${colors.blue}Found ${registeredTemplates.length} registered templates in template-loader.js${colors.reset}`);
    return registeredTemplates;
  } catch (error) {
    console.error(`${colors.red}Error reading template-loader.js: ${error.message}${colors.reset}`);
    return [];
  }
};

// Find template usage in manager files
const findTemplateUsage = registeredTemplates => {
  const managerFiles = glob.sync('*.js', { cwd: MANAGERS_DIR });
  const usage = {};
  
  // Initialize usage tracking for all templates
  registeredTemplates.forEach(template => {
    usage[template.id] = [];
  });
  
  managerFiles.forEach(file => {
    try {
      const managerPath = path.join(MANAGERS_DIR, file);
      const content = fs.readFileSync(managerPath, 'utf8');
      const managerName = path.basename(file, '.js');
      
      registeredTemplates.forEach(template => {
        // Look for template.create or template.insert calls with this template ID
        const createRegex = new RegExp(`(create|insert)\\(['"']${template.id}['"']`, 'g');
        if (createRegex.test(content)) {
          usage[template.id].push(managerName);
        }
      });
    } catch (error) {
      console.error(`${colors.red}Error reading manager file ${file}: ${error.message}${colors.reset}`);
    }
  });
  
  return usage;
};

// Verify template existence
const verifyTemplates = (allTemplateFiles, registeredTemplates) => {
  const templatePathMap = {};
  allTemplateFiles.forEach(file => {
    const relativePath = path.relative(TEMPLATES_DIR, file);
    templatePathMap[relativePath] = file;
  });
  
  let missingFiles = 0;
  let warnings = 0;
  
  console.log('\n--- Template Verification Results ---\n');
  
  registeredTemplates.forEach(template => {
    // Normalize the path to use forward slashes
    const normalizedPath = template.path.replace(/\\/g, '/');
    
    // Don't add .html extension if it's already present
    const fullPath = normalizedPath.endsWith('.html') ? normalizedPath : `${normalizedPath}.html`;
    
    if (templatePathMap[fullPath]) {
      console.log(`${colors.green}✓ Template ${template.id} -> ${fullPath}${colors.reset}`);
      
      // Verify content of template
      try {
        const content = fs.readFileSync(templatePathMap[fullPath], 'utf8');
        if (!content || content.trim() === '') {
          console.log(`  ${colors.yellow}⚠ Template file is empty${colors.reset}`);
          warnings++;
        }
        
        // Check for template element
        if (!content.includes('<template') && !content.includes('<div') && !content.includes('<span')) {
          console.log(`  ${colors.yellow}⚠ Template may not contain a valid HTML element${colors.reset}`);
          warnings++;
        }
      } catch (error) {
        console.error(`  ${colors.red}✗ Error reading template content: ${error.message}${colors.reset}`);
        missingFiles++;
      }
    } else {
      console.error(`${colors.red}✗ Missing template file for ${template.id} -> ${fullPath}${colors.reset}`);
      missingFiles++;
    }
  });
  
  return {
    missingFiles,
    warnings
  };
};

// Check for templates not registered in template-loader.js
const findUnregisteredTemplates = (allTemplateFiles, registeredTemplates) => {
  const registeredPaths = registeredTemplates.map(t => {
    const normalizedPath = t.path.replace(/\\/g, '/');
    const pathWithExtension = normalizedPath.endsWith('.html') ? normalizedPath : `${normalizedPath}.html`;
    return path.join(TEMPLATES_DIR, pathWithExtension).replace(/\\/g, '/');
  });
  
  const unregisteredFiles = allTemplateFiles.filter(file => {
    const normalizedPath = file.replace(/\\/g, '/');
    return !registeredPaths.includes(normalizedPath);
  });
  
  if (unregisteredFiles.length > 0) {
    console.log(`\n${colors.yellow}Found ${unregisteredFiles.length} template files not registered in template-loader.js:${colors.reset}`);
    unregisteredFiles.forEach(file => {
      const relativePath = path.relative(TEMPLATES_DIR, file);
      console.log(`  ${colors.yellow}${relativePath}${colors.reset}`);
    });
  } else {
    console.log(`\n${colors.green}All template files are properly registered in template-loader.js${colors.reset}`);
  }
  
  return unregisteredFiles;
};

// Report template usage statistics
const reportTemplateUsage = usage => {
  console.log('\n--- Template Usage by Manager ---\n');
  
  // Group by manager
  const managerUsage = {};
  
  Object.entries(usage).forEach(([templateId, managers]) => {
    managers.forEach(manager => {
      if (!managerUsage[manager]) {
        managerUsage[manager] = [];
      }
      managerUsage[manager].push(templateId);
    });
  });
  
  // Report usage by manager
  Object.entries(managerUsage).forEach(([manager, templates]) => {
    console.log(`${colors.magenta}${manager}${colors.reset} uses ${templates.length} templates:`);
    templates.forEach(templateId => {
      console.log(`  - ${templateId}`);
    });
    console.log('');
  });
  
  // Find unused templates
  const unusedTemplates = Object.entries(usage)
    .filter(([_, managers]) => managers.length === 0)
    .map(([templateId]) => templateId);
  
  if (unusedTemplates.length > 0) {
    console.log(`${colors.yellow}Found ${unusedTemplates.length} potentially unused templates:${colors.reset}`);
    unusedTemplates.forEach(templateId => {
      console.log(`  ${colors.yellow}${templateId}${colors.reset}`);
    });
  } else {
    console.log(`${colors.green}All templates are used by at least one manager${colors.reset}`);
  }
};

// Main verification function
const runVerification = () => {
  const allTemplateFiles = findAllTemplates();
  const registeredTemplates = findRegisteredTemplates();
  const usage = findTemplateUsage(registeredTemplates);
  
  const { missingFiles, warnings } = verifyTemplates(allTemplateFiles, registeredTemplates);
  const unregisteredFiles = findUnregisteredTemplates(allTemplateFiles, registeredTemplates);
  
  reportTemplateUsage(usage);
  
  // Summary
  console.log('\n--- Summary ---\n');
  console.log(`Total template files: ${allTemplateFiles.length}`);
  console.log(`Total registered templates: ${registeredTemplates.length}`);
  console.log(`Missing template files: ${missingFiles}`);
  console.log(`Unregistered template files: ${unregisteredFiles.length}`);
  console.log(`Warnings: ${warnings}`);
  
  // Exit with error code if issues found
  if (missingFiles > 0) {
    console.error(`\n${colors.red}Verification failed: ${missingFiles} template files are missing${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}Template verification completed successfully${colors.reset}`);
  }
};

// Run the verification
runVerification();