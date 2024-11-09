const fs = require('fs');
const path = require('path');
const sass = require('sass');
const cleanCSS = require('clean-css');
const ghPages = require('gh-pages');
const { execSync } = require('child_process');

// Compile SCSS files from the ./themes directory
const compileSass = () => {
  console.log('Compiling SCSS...');

  // Read all SCSS files from the themes directory
  const scssDir = path.join(__dirname, 'themes');
  const files = fs.readdirSync(scssDir).filter(file => file.endsWith('.scss'));

  files.forEach(file => {
    const result = sass.renderSync({
      file: path.join(scssDir, file), // Path to each SCSS file
    });

    // Generate the regular CSS file
    const cssFile = file.replace('.scss', '.css');
    fs.writeFileSync(path.join(__dirname, 'dist', cssFile), result.css);

    // Minify and generate the .min.css file
    const minified = new cleanCSS().minify(result.css.toString());
    const minifiedFile = file.replace('.scss', '.min.css');
    fs.writeFileSync(path.join(__dirname, 'dist', minifiedFile), minified.styles);
  });
};

// Copy all files from the themes folder to the dist folder
const copyFiles = () => {
  const themesDir = path.join(__dirname, 'themes');
  
  // Copy all files from the themes folder to dist
  const filesToCopy = fs.readdirSync(themesDir);
  filesToCopy.forEach(file => {
    const source = path.join(themesDir, file);
    const destination = path.join(__dirname, 'dist', file);

    if (fs.existsSync(source)) {
      if (fs.lstatSync(source).isDirectory()) {
        execSync(`cp -r ${source} ${destination}`); // Copy directories
      } else {
        fs.copyFileSync(source, destination); // Copy files
      }
    }
  });
};

// Deploy to GitHub Pages
const deployToGitHubPages = () => {
  ghPages.publish('dist', {
    branch: 'gh-pages',
    repo: 'https://github.com/OmgRod/GDWebThemes.git', // Replace with your repo URL
    user: {
      name: 'GitHub Actions', // Your GitHub username
      email: 'your-email@example.com', // Your email
    },
  }, (err) => {
    if (err) {
      console.error('Deployment failed:', err);
    } else {
      console.log('Deployment successful!');
    }
  });
};

// Run the build process
const build = () => {
  console.log('Building...');
  compileSass();
  copyFiles();
  deployToGitHubPages();
};

// Execute build
build();