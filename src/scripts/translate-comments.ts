import * as fs from 'fs';
import * as path from 'path';

// Interface for translation dictionary
interface TranslationDictionary {
  [key: string]: string;
}

// ============ INSERT YOUR TRANSLATION DICTIONARIES HERE ============
// Example how to insert:
const translations: TranslationDictionary = {
    "* Gets Discord user ID by their Discord tag (username#discriminator)": "* Gets Discord user ID by their Discord tag (username#discriminator)",
    "* Creates private channel for artist application": "* Creates private channel for artist application",
    "* Sends application status message to channel": "* Sends application status message to channel",
    "* Updates application status message": "* Updates application status message",
    "* Finds the latest message from the bot and updates it": "* Finds the latest message from the bot and updates it",
    "* Forms text of application status message": "* Forms text of application status message",
    "* Returns emoji for application status": "* Returns emoji for application status",
    "* Formats status for display": "* Formats status for display",
    "* Updates user role depending on application status": "* Updates user role depending on application status",
    "* Deletes channel in Discord": "* Deletes channel in Discord"  
};
// ===============================================================

/**
 * Recursively gets all files from specified directory
 * @param dir Directory to scan
 * @param fileList Accumulative list of files
 * @returns List of all found files
 */
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  // Check if directory exists
  if (!fs.existsSync(dir)) {
    console.error(`Directory ${dir} does not exist!`);
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    
    if (fs.statSync(filePath).isDirectory()) {
      // Recursively traverse subdirectories
      getAllFiles(filePath, fileList);
    } else if (path.extname(filePath).match(/\.(js|jsx|ts|tsx)$/)) {
      // Add only files with required extensions
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Escapes special characters for regular expressions
 * @param string String to escape
 * @returns Escaped string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replaces Russian comments with English ones in file
 * @param filePath Path to file
 * @returns true if changes were made
 */
function replaceCommentsInFile(filePath: string): boolean {
  let content: string;
  
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (error: unknown) {
    console.error(`Error reading file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
  
  let hasChanges = false;

  // Check for Russian letters in file (for optimization)
  if (!/[А-Яа-яЁё]/.test(content)) {
    return false;
  }

  // Iterate through all translations and make replacements
  for (const [russian, english] of Object.entries(translations)) {
    if (content.includes(russian)) {
      // Use escaping for safe replacement
      const escapedRussian = escapeRegExp(russian);
      content = content.replace(new RegExp(escapedRussian, 'g'), english);
      hasChanges = true;
    }
  }

  // If there were changes, write the file
  if (hasChanges) {
    try {
      fs.writeFileSync(filePath, content);
      return true;
    } catch (error: unknown) {
      console.error(`Error writing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }
  
  return false;
}

/**
 * Main function for translating comments in project
 * @param directory Project directory
 */
function translateProject(directory: string): void {
  const files = getAllFiles(directory);
  let changedFiles = 0;
  let errorFiles = 0;
  
  // Display total number of found files
  console.log(`\x1b[36mFiles found: ${files.length}\x1b[0m\n`);
  
  // Create object for counting translations
  const translationCounter: Record<string, number> = {};
  
  // Process each file
  files.forEach(file => {
    try {
      const fileChanged = replaceCommentsInFile(file);
      if (fileChanged) {
        changedFiles++;
        console.log(`\x1b[32m[OK] Comments translated in: ${file}\x1b[0m`);
        
        // Increase counter of used translations
        Object.keys(translations).forEach(key => {
          try {
            const fileContent = fs.readFileSync(file, 'utf8');
            if (fileContent.includes(translations[key])) {
              translationCounter[key] = (translationCounter[key] || 0) + 1;
            }
          } catch (error: unknown) {
            // Ignore errors when counting translations
          }
        });
      }
    } catch (error: unknown) {
      errorFiles++;
      console.error(`\x1b[31m[ERROR] Processing file ${file}: ${error instanceof Error ? error.message : String(error)}\x1b[0m`);
    }
  });
  
  // Display statistics
  console.log(`\n\x1b[36mTotal files processed: ${files.length}\x1b[0m`);
  console.log(`\x1b[32mFiles modified: ${changedFiles}\x1b[0m`);
  
  if (errorFiles > 0) {
    console.log(`\x1b[31mErrors in files: ${errorFiles}\x1b[0m`);
  }
  
  // Display statistics по использованным переводам
  console.log(`\n\x1b[36mTotal translations used: ${Object.keys(translationCounter).length} out of ${Object.keys(translations).length}\x1b[0m`);
}

// Get path to project directory from command line arguments
const projectDir = process.argv[2];

if (!projectDir) {
  console.error('\x1b[31mYou must specify a project directory!\x1b[0m');
  console.log('\x1b[33mUsage: ts-node translate-comments.ts ./path/to/your/project\x1b[0m');
  process.exit(1);
}

console.log(`\x1b[36mStarting comment translation in directory: ${projectDir}\x1b[0m\n`);
translateProject(projectDir);