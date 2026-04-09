const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src/pages', (filePath) => {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content
      .replace(/bg-green-50 text-green-700 border-green-200/g, 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50')
      .replace(/bg-amber-50 text-amber-700 border-amber-200/g, 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50')
      .replace(/bg-rose-50\/50/g, 'bg-rose-50/50 dark:bg-rose-900/20')
      .replace(/border-rose-100/g, 'border-rose-100 dark:border-rose-800/50')
      .replace(/bg-blue-50 text-blue-600/g, 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400')
      .replace(/bg-emerald-50 text-emerald-600/g, 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400')
      .replace(/bg-amber-50 text-amber-600/g, 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400')
      .replace(/bg-indigo-50 text-indigo-600/g, 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400')
      .replace(/dark:bg-blue-900\/20 dark:bg-blue-900\/20/g, 'dark:bg-blue-900/20')
      .replace(/dark:text-blue-400 dark:text-blue-400/g, 'dark:text-blue-400')
      .replace(/dark:bg-emerald-900\/20 dark:bg-emerald-900\/20/g, 'dark:bg-emerald-900/20')
      .replace(/dark:text-emerald-400 dark:text-emerald-400/g, 'dark:text-emerald-400')
      .replace(/dark:bg-amber-900\/20 dark:bg-amber-900\/20/g, 'dark:bg-amber-900/20')
      .replace(/dark:text-amber-400 dark:text-amber-400/g, 'dark:text-amber-400')
      .replace(/dark:bg-indigo-900\/20 dark:bg-indigo-900\/20/g, 'dark:bg-indigo-900/20')
      .replace(/dark:text-indigo-400 dark:text-indigo-400/g, 'dark:text-indigo-400');
      
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Updated', filePath);
    }
  }
});
