const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove bg-waves div
    content = content.replace(/<div class="bg-waves">[\s\S]*?<\/div>\s*<header/g, '<header');
    content = content.replace(/<div class="bg-waves">[\s\S]*?<\/div>\s*<div class="card-preview-wrapper"/g, '<div class="card-preview-wrapper"');
    content = content.replace(/<div class="bg-waves">[\s\S]*?<\/div>\s*<div class="auth-container"/g, '<div class="auth-container"');

    // Also remove bg-blobs just in case
    content = content.replace(/<div class="bg-blobs">[\s\S]*?<\/div>\s*<header/g, '<header');
    
    // Some pages don't have header/auth-container. Just match <div class="bg-waves">...</div> up to its closing tag safely
    content = content.replace(/<div class="bg-waves">[\s\S]*?<\/div>\s*/g, '');

    // Add script tag before </body> if not present
    if (!content.includes('bg-script.js')) {
        content = content.replace(/<\/body>/i, '    <script src="./js/bg-script.js"></script>\n</body>');
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Refactored ${file}`);
});
