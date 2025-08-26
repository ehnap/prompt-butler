# Prompt Butler

AI提示词管理助手 - 高效管理和使用AI提示词的Chrome扩展程序。

## 作者
@ehnap

## 功能特性

- ✅ **提示词管理**: 添加、编辑和组织提示词，支持分类和标签
- ✅ **快速插入**: 点击提示词即可插入到当前活动的输入框
- ✅ **右键菜单**: 选中网页文本后右键添加到提示词管理器
- ✅ **搜索筛选**: 通过搜索框和标签云快速查找提示词
- ✅ **美观界面**: 现代化卡片式设计，带有流畅动画效果
- ✅ **数据持久化**: 使用Chrome存储API本地保存所有数据

## 安装方法

### 方法一：下载发布版本（推荐）

1. 访问 [Releases 页面](../../releases)
2. 下载最新版本的 `prompt-butler-extension.zip` 文件
3. 解压到本地文件夹
4. 在Chrome中加载扩展：
   - 打开 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择解压后的文件夹

### 方法二：从源码构建

1. 克隆项目：
   ```bash
   git clone <repository-url>
   cd prompt-butler
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 构建扩展：
   ```bash
   node build-optimized.js
   ```

4. 在Chrome中加载扩展：
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 `dist/` 文件夹

## 使用说明

### 🚀 快速开始

1. **安装扩展**：按照上述安装方法完成安装
2. **点击扩展图标**：在浏览器工具栏中找到 Prompt Butler 图标并点击
3. **开始使用**：浏览内置的示例提示词或添加自己的提示词

### ✨ 核心功能

#### 添加提示词
- **方法一**：点击扩展图标，使用"添加提示词"按钮
- **方法二**：在网页上选中文本，右键选择"添加到Prompt Butler"

#### 使用提示词
1. 点击扩展图标打开管理界面
2. 浏览或搜索所需的提示词
3. **点击提示词标题或内容**：
   - 🎯 **有输入框**：自动插入到当前页面的输入框
   - 📋 **无输入框**：自动复制到剪贴板并提示
4. 扩展会智能检测页面输入框并选择最佳操作方式

#### 管理提示词
- **🔍 搜索**：使用搜索框按标题、内容或标签查找提示词
- **🏷️ 标签筛选**：点击标签云中的标签进行筛选
- **✏️ 编辑**：点击提示词右上角的"编辑"按钮
- **🗑️ 删除**：点击提示词右上角的"删除"按钮
- **📁 分类管理**：提示词按分类自动组织
- **📤 导入导出**：支持数据备份和迁移

### 💡 使用技巧

- **智能插入**：扩展会自动检测页面上的输入框，包括文本框、搜索框、富文本编辑器等
- **右键添加**：在任何网页上选中有用的文本，右键即可快速添加为提示词
- **标签管理**：合理使用标签可以让提示词更容易查找和管理
- **快捷操作**：点击提示词内容区域即可快速使用，无需额外步骤

## 项目结构

```
├── src/                    # 源文件目录
│   ├── popup.html         # 弹窗界面结构
│   ├── popup.css          # 界面样式
│   ├── popup.js           # Chrome API 通信
│   └── popup-ui.js        # UI 交互逻辑
├── public/                # 静态资源
│   ├── background.js      # 后台服务脚本
│   └── content.js         # 内容脚本
├── dist/                  # 构建输出目录
├── manifest.json          # Chrome扩展清单文件
├── build-optimized.js     # 优化构建脚本
└── package.json           # 项目依赖配置
```

## 技术详情

### 架构设计

- **Manifest V3**: 使用最新的Chrome扩展架构
- **Service Worker**: 后台脚本处理右键菜单和跨标签页通信
- **Content Script**: 注入到网页中进行文本插入
- **Storage API**: 使用 `chrome.storage.local` 进行本地数据持久化

### 使用的API

- `chrome.storage` - 数据持久化
- `chrome.contextMenus` - 右键菜单功能
- `chrome.scripting` - 内容注入
- `chrome.tabs` - 活动标签页检测

### 构建系统

项目使用模块化构建系统：
- 将HTML、CSS、JavaScript分离到独立的源文件中
- 自动组装成最终的扩展包
- 提供便捷的维护和开发工作流

## 开发指南

### 构建扩展

```bash
# 构建扩展
node build-optimized.js

# 构建后的扩展文件位于 dist/ 目录
```

### 文件结构说明

- **源文件** (`src/`): 开发时编辑这些文件
- **构建输出** (`dist/`): 生成的Chrome扩展文件
- **构建脚本** (`build-optimized.js`): 将源文件组装成扩展

### 修改代码

1. 编辑 `src/` 目录下的源文件
2. 运行构建脚本: `node build-optimized.js`
3. 在Chrome中重新加载扩展查看更改

## 技术栈

- Chrome Extension Manifest V3
- 原生 JavaScript + HTML + CSS
- Chrome Storage API
- Chrome Context Menus API
- Chrome Scripting API

### 版本历史

#### v1.0.0
- ✅ 初始版本发布
- ✅ 核心提示词管理功能
- ✅ 智能文本插入（输入框优先，剪贴板降级）
- ✅ 右键菜单集成
- ✅ 搜索和标签筛选功能
- ✅ 数据导入导出功能
- ✅ 现代化UI设计和动画效果
- ✅ GitHub Actions 自动构建

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🆘 支持与反馈

如果遇到问题或有建议：

1. 📋 查看 [Issues](../../issues) 页面
2. 🐛 [报告 Bug](../../issues/new?template=bug_report.md)
3. 💡 [功能建议](../../issues/new?template=feature_request.md)
4. ⭐ 如果觉得有用，请给项目点个星！

## 👨‍💻 作者

**@ehnap** - 项目创建者和维护者

---

<div align="center">

**🎯 让AI提示词管理变得简单高效！**

[下载使用](../../releases) • [查看源码](../../) • [报告问题](../../issues)

</div>
