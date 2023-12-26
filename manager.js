import fs from 'fs';
import path from 'path';

import inquirer from 'inquirer';
import autocompletePrompt from 'inquirer-autocomplete-prompt';

import express from 'express';
import open from 'open';
import favicon from 'serve-favicon';
import WebSocket, { WebSocketServer } from 'ws';

const BASE_DIR = 'src';
const PORT = 8080;

// Parse command line arguments for the examples flag
const args = process.argv.slice(2);
const isExamplesFlagSet = args.includes('--examples');

// Register the autocomplete prompt type
inquirer.registerPrompt('autocomplete', autocompletePrompt);

// Initialize the server
const app = express();
const server = app.listen(PORT);
const wss = new WebSocketServer({ server });


/**
 * Starts the server with the specified presentation HTML content.
 * @param {string} filePath - The path to the presentation content file.
 */
async function startServer(filePath) {
  // Serve favicon
  app.use(favicon('assets/favicon.ico'));
  // Serve static files from assets and reveal.js
  app.use('/', express.static('assets'));
  app.use('/reveal.js', express.static('node_modules/reveal.js'));

  // Serve the presentation
  app.get('/', async (req, res) => {
    try {
      const presentation = await buildPresentation(filePath);
      res.send(presentation);
    } catch (error) {
      console.error('Error serving presentation:', error);
      res.status(500).send('Error serving presentation');
    }
  });

  console.log(`Server running at http://localhost:${PORT}/`);

  // Open the URL in a new browser instance
  open(`http://localhost:${PORT}/`);

  // Watch for changes in the content file
  fs.watch(filePath, async (eventType) => {
    if (eventType === 'change') {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('reload');
        }
      });
    }
  });
}


/**
 * Builds the presentation HTML content.
 * @param {string} filePath - The path to the presentation content file.
 * @returns {Promise<string>} - The presentation HTML content.
 */
function buildPresentation(filePath) {
  return new Promise((resolve, reject) => {
    // Read the index file
    fs.readFile('src/index.html', 'utf8', (error, index) => {
      if (error) {
        console.error('Error reading main template:', error);
        reject(error);
        return;
      }
      // Read the content file
      fs.readFile(filePath, 'utf8', (error, content) => {
        if (error) {
          console.error('Error reading content file:', error);
          reject(error);
          return;
        }

        // Extract the title from the content file path
        const fileTitle = path
          .basename(filePath, path.extname(filePath))
          .split(/[-_]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        // Update title, web socket port, and replace content placeholder with the actual content
        let presentation = index
        presentation = presentation.replace('{{TITLE}}', fileTitle);
        presentation = presentation.replace('{{PORT}}', PORT.toString());
        presentation = presentation.replace('<!-- CONTENT -->', content);
        resolve(presentation);
      });
    });
  });
}


/**
 * Recursively searches for files in a directory that match given include patterns and do not match
 * exclude patterns.
 * @param {string} baseDir - Base directory for relative path calculation.
 * @param {string} dir - The directory to search in.
 * @param {RegExp[]} includePatterns - List of regular expression patterns to include files.
 * @param {RegExp[]} excludePatterns - List of regular expression patterns to exclude files.
 * @param {string[]} files - Accumulated list of files.
 * @returns {string[]} - The file paths of the found presentation content files.
 */
function searchPresentationsInDirectory(
  baseDir, dir, includePatterns, excludePatterns, files = []
) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const relativePath = path.relative(baseDir, filePath);

    if (fs.statSync(filePath).isDirectory()) {
      if (!excludePatterns.some(pattern => pattern.test(relativePath))) {
        searchPresentationsInDirectory(baseDir, filePath, includePatterns, excludePatterns, files);
      }
    } else if (includePatterns.some(pattern => pattern.test(relativePath)) &&
               !excludePatterns.some(pattern => pattern.test(relativePath))) {
      files.push(relativePath);
    }
  });
  return files;
}


/**
 * Searches for presentation content files based on include and exclude patterns.
 * @param {object} answers - The answers to the prompt.
 * @param {string} input - The user input.
 * @returns {Promise<string[]>} - The file paths of the found presentation content files.
 */
function searchPresentations(answers, input = '') {
  return new Promise((resolve) => {
    const includePatterns = [new RegExp(`.*${input}.*\.html$`, 'i')];
    const excludePatterns = [/^index.html$/];

    // Modify patterns based on the examples flag
    if (isExamplesFlagSet) {
      excludePatterns.push(/^(?!examples).*/);
    } else {
      excludePatterns.push(/^(?:examples).*/);  // Exclude example files
    }

    const files = searchPresentationsInDirectory(
      BASE_DIR, BASE_DIR, includePatterns, excludePatterns
    );
    resolve(files);
  });
}


/**
 * Prompts the user for the path to the presentation content file.
 * @returns {Promise<object>} - The answers to the prompt.
 */
function promptForPresentation() {
  return inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'filePath',
      message: 'Search for a presentation:',
      source: searchPresentations
    }
  ]);
}


// Prompt the user for the presentation content file path and start the server.
promptForPresentation().then(async (answers) => {
  try {
    await startServer(path.join(BASE_DIR, answers.filePath));
  } catch (error) {
    console.error('Failed to build presentation:', error);
  }
});
