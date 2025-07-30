#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const srcDir = './src';
const radixComponents = new Set();
const tailwindClasses = new Set();
const fileExtensions = ['.tsx', '.ts', '.jsx', '.js'];

function walkDirectory(dir) {
  const files = readdirSync(dir);

  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (fileExtensions.includes(extname(file))) {
      analyzeFile(filePath);
    }
  }
}

function analyzeFile(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');

    // Find Radix UI component imports
    const radixImportPattern = /import\s*{([^}]+)}\s*from\s*["']@radix-ui\/[^"']+["']/g;
    let match;

    while ((match = radixImportPattern.exec(content)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim().replace(/\s+as\s+\w+/, ''));
      imports.forEach(imp => radixComponents.add(imp));
    }

    // Find Tailwind classes (basic detection)
    const tailwindPattern = /className\s*=\s*["'`]([^"'`]+)["'`]/g;
    while ((match = tailwindPattern.exec(content)) !== null) {
      const classes = match[1].split(/\s+/);
      classes.forEach(cls => {
        if (cls && (cls.includes('-') || cls.match(/^(text|bg|border|p|m|w|h|flex|grid|rounded)/))) {
          tailwindClasses.add(cls);
        }
      });
    }

    // Find template literal classes
    const templateLiteralPattern = /className\s*=\s*{[^}]*`([^`]+)`[^}]*}/g;
    while ((match = templateLiteralPattern.exec(content)) !== null) {
      const classes = match[1].split(/\s+/);
      classes.forEach(cls => {
        if (cls && (cls.includes('-') || cls.match(/^(text|bg|border|p|m|w|h|flex|grid|rounded)/))) {
          tailwindClasses.add(cls);
        }
      });
    }
  } catch (error) {
    console.warn(`Error analyzing file ${filePath}:`, error.message);
  }
}

console.log('🔍 Analyzing component usage...\n');

walkDirectory(srcDir);

console.log('📦 Radix UI Components Used:');
console.log('=====================================');
const sortedRadixComponents = Array.from(radixComponents).sort();
if (sortedRadixComponents.length === 0) {
  console.log('No Radix UI components found');
} else {
  sortedRadixComponents.forEach((comp, index) => {
    console.log(`${index + 1}. ${comp}`);
  });
}
console.log(`\nTotal: ${sortedRadixComponents.length} components\n`);

console.log('🎨 Most Common Tailwind Classes:');
console.log('=====================================');
const sortedTailwindClasses = Array.from(tailwindClasses)
  .filter(cls => !cls.includes('${') && !cls.includes('var(')) // Filter out dynamic classes
  .sort();

if (sortedTailwindClasses.length === 0) {
  console.log('No Tailwind classes found');
} else {
  // Show first 20 most common classes
  sortedTailwindClasses.slice(0, 20).forEach((cls, index) => {
    console.log(`${index + 1}. ${cls}`);
  });

  if (sortedTailwindClasses.length > 20) {
    console.log(`... and ${sortedTailwindClasses.length - 20} more`);
  }
}
console.log(`\nTotal: ${sortedTailwindClasses.length} unique classes\n`);

console.log('💡 Optimization Suggestions:');
console.log('=====================================');

if (sortedRadixComponents.length > 0) {
  console.log('✅ Consider tree-shaking unused Radix UI components');
  console.log('✅ Only import components you actually use');
}

if (sortedTailwindClasses.length > 100) {
  console.log('⚠️  High number of Tailwind classes detected');
  console.log('✅ Consider using PurgeCSS to remove unused styles');
}

// Check for potential optimizations
const expensiveComponents = ['Dialog', 'DropdownMenu', 'Popover', 'Select', 'Tooltip'];
const usedExpensiveComponents = sortedRadixComponents.filter(comp =>
  expensiveComponents.some(expensive => comp.includes(expensive))
);

if (usedExpensiveComponents.length > 0) {
  console.log(`⚠️  Heavy components detected: ${usedExpensiveComponents.join(', ')}`);
  console.log('✅ Consider lazy loading these components');
}

console.log('\n🏁 Analysis complete!');
console.log('Run this script before and after optimizations to track improvements.');
