const fs = require('fs');
const path = require('path');

// 确保目录存在
function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// 读取文件内容
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`读取文件失败: ${filePath}`, error.message);
        return '';
    }
}

// 写入文件
function writeFile(filePath, content) {
    try {
        ensureDir(path.dirname(filePath));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ 已生成: ${filePath}`);
    } catch (error) {
        console.error(`写入文件失败: ${filePath}`, error.message);
    }
}

// 复制文件
function copyFile(src, dest) {
    try {
        ensureDir(path.dirname(dest));
        fs.copyFileSync(src, dest);
        console.log(`✓ 已复制: ${src} -> ${dest}`);
    } catch (error) {
        console.error(`复制文件失败: ${src} -> ${dest}`, error.message);
    }
}

console.log('🚀 开始构建 Chrome 扩展...\n');

// 1. 复制 HTML 文件
const htmlContent = readFile('src/popup.html');
writeFile('dist/popup.html', htmlContent);

// 2. 复制 CSS 文件
const cssContent = readFile('src/popup.css');
writeFile('dist/popup.css', cssContent);

// 3. 复制 JavaScript 文件
const jsContent = readFile('src/popup.js');
writeFile('dist/popup.js', jsContent);

const uiJsContent = readFile('src/popup-ui.js');
writeFile('dist/popup-ui.js', uiJsContent);

// 4. 复制 Chrome 扩展核心文件
copyFile('manifest.json', 'dist/manifest.json');
copyFile('public/background.js', 'dist/background.js');
copyFile('public/content.js', 'dist/content.js');

// 5. 复制图标文件
copyFile('resource/logo16.png', 'dist/logo16.png');
copyFile('resource/logo32.png', 'dist/logo32.png');
copyFile('resource/logo48.png', 'dist/logo48.png');
copyFile('resource/logo128.png', 'dist/logo128.png');

console.log('\n🎉 Chrome扩展构建完成！');
console.log('📁 插件文件位于 dist/ 目录');
console.log('🔧 在Chrome中加载 dist/ 目录作为未打包的扩展程序');

console.log('\n✨ 优化说明:');
console.log('• 📁 代码模块化：HTML、CSS、JS 分离');
console.log('• 🔧 便于维护：每个文件职责单一');
console.log('• 🎨 样式独立：CSS 文件可单独编辑');
console.log('• 💻 逻辑分离：UI 逻辑与通信逻辑分开');
console.log('• 🚀 构建简化：一键生成所有文件');

console.log('\n📋 文件结构:');
console.log('├── src/');
console.log('│   ├── popup.html     # 弹窗界面结构');
console.log('│   ├── popup.css      # 界面样式');
console.log('│   ├── popup.js       # Chrome API 通信');
console.log('│   └── popup-ui.js    # UI 交互逻辑');
console.log('├── dist/              # 构建输出目录');
console.log('└── build-optimized.js # 优化构建脚本');

console.log('\n📋 使用方法:');
console.log('1. 修改 src/ 目录下的源文件');
console.log('2. 运行: node build-optimized.js');
console.log('3. 在 Chrome 中重新加载扩展');