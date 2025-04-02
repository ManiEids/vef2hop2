/**
 * This script fixes line endings and trailing spaces in JavaScript files.
 * Run with: node scripts/fix-line-endings.js
 */

const fs = require('fs');
const path = require('path');

const directoriesToProcess = ['js'];
const fileExtensions = ['.js', '.json'];
const rootDir = path.resolve(__dirname, '..');

// Fix line endings and trailing spaces in a file
function fixFileLineEndings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Fix trailing spaces
    const noTrailingSpaces = content.replace(/[ \t]+$/gm, '');

    // Convert to CRLF for Windows (this is what ESLint is now expecting)
    const normalizedContent = noTrailingSpaces.replace(/\r?\n/g, '\r\n');

    if (content !== normalizedContent) {
      fs.writeFileSync(filePath, normalizedContent, 'utf8');
      console.log(`Fixed line endings in ${filePath}`);
    } else {
      console.log(`No changes needed for ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

// Process files with specific extensions in the given directories
function processDirectory(directory) {
  const fullPath = path.join(rootDir, directory);

  try {
    const files = fs.readdirSync(fullPath);

    files.forEach((file) => {
      const filePath = path.join(fullPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(path.join(directory, file));
      } else if (fileExtensions.includes(path.extname(file))) {
        fixFileLineEndings(filePath);
      }
    });
  } catch (error) {
    console.error(`Error processing directory ${directory}:`, error);
  }
}

// Process all specified directories
directoriesToProcess.forEach(processDirectory);

console.log('Line ending normalization complete!');
