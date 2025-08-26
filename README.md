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

### 从源码安装

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

### 添加提示词

1. **通过扩展弹窗**: 点击扩展图标，使用"添加提示词"按钮
2. **通过右键菜单**: 在网页上选中文本，右键选择"添加到Prompt Butler"

### 使用提示词

1. 点击扩展图标打开弹窗
2. 浏览或搜索所需的提示词
3. 点击提示词标题或内容即可插入到活动输入框
4. 扩展会自动找到最近的输入框并填充内容

### 管理提示词

- **编辑**: 鼠标悬停在提示词上，点击"编辑"按钮
- **搜索**: 使用搜索框按标题、内容或标签查找提示词
- **标签筛选**: 点击标签云中的标签进行筛选
- **分类管理**: 提示词按分类自动组织

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

## 版本历史

### v1.0.0
- 初始版本发布
- 核心提示词管理功能
- 右键菜单集成
- 搜索和筛选功能
- 现代化UI设计和动画效果

## 贡献指南

1. Fork 项目仓库
2. 创建功能分支
3. 进行代码修改
4. 充分测试
5. 提交 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 支持

如果遇到问题或有建议，请：
1. 查看现有的 Issues
2. 创建新的 Issue 并提供详细信息
3. 包含重现问题的步骤

## 联系方式

项目作者：@ehnap