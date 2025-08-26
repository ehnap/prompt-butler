// UI控制脚本
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Chrome插件popup UI已加载');
  
  const promptList = document.getElementById('promptList');
  const addBtn = document.getElementById('addPromptBtn');
  const searchBox = document.getElementById('searchInput');
  const tagCloud = document.getElementById('tagCloud');
  const categoryTitle = document.getElementById('categoryTitle');
  
  let allPrompts = [];
  let filteredPrompts = [];
  let activeTagFilters = new Set();
  let searchQuery = '';
  
  // 默认提示词数据
  const defaultPrompts = [
    {
      id: '1',
      title: '写作助手',
      content: '请帮我写一篇关于[主题]的文章，要求：1. 结构清晰 2. 逻辑严谨 3. 语言流畅',
      tags: ['写作', '助手', '文章'],
      category: '写作'
    },
    {
      id: '2', 
      title: '代码审查',
      content: '请审查以下代码，重点关注：1. 代码质量 2. 性能优化 3. 安全性 4. 最佳实践',
      tags: ['代码', '审查', '编程', '优化'],
      category: '编程'
    },
    {
      id: '3',
      title: '翻译助手',
      content: '请将以下内容翻译成[目标语言]，要求：1. 准确性 2. 流畅性 3. 保持原意',
      tags: ['翻译', '语言', '助手'],
      category: '翻译'
    },
    {
      id: '4',
      title: 'SQL查询优化',
      content: '请帮我优化这个SQL查询，提高查询性能并确保结果准确性',
      tags: ['SQL', '数据库', '优化', '编程'],
      category: '编程'
    },
    {
      id: '5',
      title: '产品需求分析',
      content: '请帮我分析这个产品需求，包括用户痛点、解决方案和实现优先级',
      tags: ['产品', '需求', '分析', '用户'],
      category: '产品'
    },
    {
      id: '6',
      title: '学习计划制定',
      content: '请帮我制定一个关于[技能/知识]的学习计划，包括学习路径和时间安排',
      tags: ['学习', '计划', '技能', '教育'],
      category: '学习'
    }
  ];
  
  // 加载提示词
  async function loadPrompts() {
    try {
      let prompts = [];
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['prompts']);
        prompts = result.prompts || defaultPrompts;
      } else {
        prompts = defaultPrompts;
      }
      
      allPrompts = prompts;
      filteredPrompts = [...prompts];
      renderTagCloud();
      renderPrompts();
      updateFilterInfo();
    } catch (error) {
      console.error('加载提示词失败:', error);
      allPrompts = defaultPrompts;
      filteredPrompts = [...defaultPrompts];
      renderTagCloud();
      renderPrompts();
      updateFilterInfo();
    }
  }
  
  // 渲染标签云
  function renderTagCloud() {
    const allTags = new Set();
    allPrompts.forEach(prompt => {
      prompt.tags.forEach(tag => allTags.add(tag));
    });
    
    const sortedTags = Array.from(allTags).sort();
    
    tagCloud.innerHTML = sortedTags.map(tag => {
      const count = allPrompts.filter(prompt => prompt.tags.includes(tag)).length;
      const isActive = activeTagFilters.has(tag);
      return `<span class="tag-filter ${isActive ? 'active' : ''}" data-tag="${tag}">${tag} (${count})</span>`;
    }).join('') + (activeTagFilters.size > 0 ? '<button class="clear-filters" id="clearFilters">清除筛选</button>' : '');
    
    // 绑定标签点击事件
    tagCloud.querySelectorAll('.tag-filter').forEach(tagEl => {
      tagEl.addEventListener('click', function() {
        const tag = this.dataset.tag;
        toggleTagFilter(tag);
      });
    });
    
    // 绑定清除筛选按钮
    const clearBtn = document.getElementById('clearFilters');
    if (clearBtn) {
      clearBtn.addEventListener('click', clearAllFilters);
    }
  }
  
  // 切换标签筛选
  function toggleTagFilter(tag) {
    if (activeTagFilters.has(tag)) {
      activeTagFilters.delete(tag);
    } else {
      activeTagFilters.add(tag);
    }
    applyFilters();
    renderTagCloud();
    updateFilterInfo();
  }
  
  // 清除所有筛选
  function clearAllFilters() {
    activeTagFilters.clear();
    searchQuery = '';
    searchBox.value = '';
    applyFilters();
    renderTagCloud();
    updateFilterInfo();
  }
  
  // 应用筛选
  function applyFilters() {
    filteredPrompts = allPrompts.filter(prompt => {
      // 搜索筛选
      const matchesSearch = !searchQuery || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // 标签筛选
      const matchesTags = activeTagFilters.size === 0 || 
        Array.from(activeTagFilters).every(tag => prompt.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
    
    renderPrompts();
  }
  
  // 更新筛选信息
  function updateFilterInfo() {
    const totalCount = allPrompts.length;
    const filteredCount = filteredPrompts.length;
    
    if (searchQuery || activeTagFilters.size > 0) {
      categoryTitle.textContent = `筛选结果 (${filteredCount}/${totalCount})`;
    } else {
      categoryTitle.textContent = '所有提示词';
    }
  }
  
  // 渲染提示词列表
  function renderPrompts() {
    if (filteredPrompts.length === 0) {
      if (allPrompts.length === 0) {
        promptList.innerHTML = '<div class="empty-state">暂无提示词，点击添加按钮创建第一个</div>';
      } else {
        promptList.innerHTML = '<div class="no-results">没有找到匹配的提示词，请尝试其他搜索条件</div>';
      }
      return;
    }
    
    promptList.innerHTML = filteredPrompts.map(prompt => `
      <div class="prompt-item" data-id="${prompt.id}">
        <div class="prompt-header">
          <div class="prompt-title">${prompt.title}</div>
          <div class="prompt-actions">
            <button class="edit-btn" data-id="${prompt.id}">编辑</button>
            <button class="delete-btn" data-id="${prompt.id}">删除</button>
          </div>
        </div>
        <div class="prompt-category">${prompt.category}</div>
        <div class="prompt-content">${prompt.content}</div>
        <div class="prompt-tags">
          ${prompt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      </div>
    `).join('');
    
    // 添加点击事件 - 只对标题和内容区域生效
    document.querySelectorAll('.prompt-item').forEach(item => {
      const promptTitle = item.querySelector('.prompt-title');
      const promptContent = item.querySelector('.prompt-content');
      
      [promptTitle, promptContent].forEach(element => {
        element.addEventListener('click', function(e) {
          e.stopPropagation();
          const promptId = item.dataset.id;
          const prompt = allPrompts.find(p => p.id === promptId);
          if (prompt) {
            insertPromptToPage(prompt.content);
          }
        });
      });
    });
    
    // 添加编辑按钮事件
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const promptId = this.dataset.id;
        const prompt = allPrompts.find(p => p.id === promptId);
        if (prompt) {
          editPrompt(prompt);
        }
      });
    });
    
    // 添加删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const promptId = this.dataset.id;
        const prompt = allPrompts.find(p => p.id === promptId);
        if (prompt) {
          showDeleteConfirmDialog(prompt);
        }
      });
    });
  }
  
  // 插入提示词到页面
  async function insertPromptToPage(content) {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // 执行脚本检查是否有可用的输入框
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (text) => {
            // 查找可用的输入元素
            function findAvailableInput() {
              // 首先检查当前活动元素
              let activeElement = document.activeElement;
              if (activeElement && (
                activeElement.tagName === 'INPUT' || 
                activeElement.tagName === 'TEXTAREA' || 
                activeElement.contentEditable === 'true'
              )) {
                return activeElement;
              }
              
              // 查找页面上可见的输入框
              const inputSelectors = [
                'textarea:not([readonly]):not([disabled])',
                'input[type="text"]:not([readonly]):not([disabled])',
                'input[type="search"]:not([readonly]):not([disabled])',
                'input[type="email"]:not([readonly]):not([disabled])',
                '[contenteditable="true"]'
              ];
              
              for (const selector of inputSelectors) {
                const elements = document.querySelectorAll(selector);
                for (const element of elements) {
                  const rect = element.getBoundingClientRect();
                  const style = window.getComputedStyle(element);
                  // 检查元素是否可见且可交互
                  if (rect.width > 0 && rect.height > 0 && 
                      style.visibility !== 'hidden' && 
                      style.display !== 'none') {
                    return element;
                  }
                }
              }
              
              return null;
            }
            
            const inputElement = findAvailableInput();
            
            if (inputElement) {
              // 找到输入框，插入文本
              inputElement.focus();
              
              if (inputElement.tagName === 'INPUT' || inputElement.tagName === 'TEXTAREA') {
                inputElement.value = text;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                inputElement.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (inputElement.contentEditable === 'true') {
                inputElement.textContent = text;
                inputElement.dispatchEvent(new Event('input', { bubbles: true }));
              }
              
              return { success: true, hasInput: true };
            } else {
              // 没有找到输入框，返回失败
              return { success: false, hasInput: false };
            }
          },
          args: [content]
        });
        
        const result = results[0].result;
        
        if (result.success && result.hasInput) {
          // 成功插入到输入框
          showNotification('已插入到输入框');
          setTimeout(() => {
            window.close();
          }, 1000);
        } else {
          // 没有找到输入框，复制到剪贴板
          await copyToClipboard(content);
        }
      } else {
        // 非Chrome扩展环境，直接复制到剪贴板
        await copyToClipboard(content);
      }
    } catch (error) {
      console.error('插入提示词失败:', error);
      // 出错时降级处理：复制到剪贴板
      await copyToClipboard(content);
    }
  }
  
  // 复制到剪贴板
  async function copyToClipboard(content) {
    try {
      await navigator.clipboard.writeText(content);
      showNotification('已复制到剪贴板');
    } catch (error) {
      console.error('复制到剪贴板失败:', error);
      // 降级方案：使用传统方法
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('已复制到剪贴板');
      } catch (fallbackError) {
        console.error('降级复制方案也失败:', fallbackError);
        showNotification('复制失败，请手动复制');
      }
    }
  }
  
  // 搜索框事件监听
  searchBox.addEventListener('input', function() {
    searchQuery = this.value.trim();
    applyFilters();
    updateFilterInfo();
  });
  
  // 编辑提示词
  function editPrompt(prompt) {
    createEditDialog(prompt);
  }
  
  // 添加按钮事件 - 使用与右键添加相同的对话框
  addBtn.addEventListener('click', function() {
    createAddDialog('');
  });
  
  // 创建添加提示词的对话框（与content.js相同的样式）
  function createAddDialog(selectedText) {
    createPromptDialog('添加到Prompt管家', null, selectedText);
  }
  
  // 创建编辑提示词的对话框
  function createEditDialog(prompt) {
    createPromptDialog('编辑提示词', prompt, '');
  }
  
  // 通用的提示词对话框创建函数
  function createPromptDialog(title, editPrompt, selectedText) {
    // 检查是否已存在对话框
    const existingDialog = document.getElementById('prompt-manager-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    // 创建对话框容器
    const dialog = document.createElement('div');
    dialog.id = 'prompt-manager-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      max-height: 500px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    `;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;

    // 预填充数据
    const promptTitle = editPrompt ? editPrompt.title : '';
    const promptContent = editPrompt ? editPrompt.content : selectedText;
    const promptCategory = editPrompt ? editPrompt.category : '编程';
    const promptTags = editPrompt ? editPrompt.tags.join(', ') : '';

    // 对话框内容
    dialog.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${title}</h3>
      </div>
      <div style="padding: 20px;">
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">标题</label>
          <input type="text" id="prompt-title" placeholder="输入提示词标题" value="${promptTitle}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">内容</label>
          <textarea id="prompt-content" rows="4" placeholder="输入提示词内容" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical; box-sizing: border-box;">${promptContent}</textarea>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">分类</label>
          <select id="prompt-category" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
            <option value="编程" ${promptCategory === '编程' ? 'selected' : ''}>编程</option>
            <option value="写作" ${promptCategory === '写作' ? 'selected' : ''}>写作</option>
            <option value="翻译" ${promptCategory === '翻译' ? 'selected' : ''}>翻译</option>
            <option value="产品" ${promptCategory === '产品' ? 'selected' : ''}>产品</option>
            <option value="学习" ${promptCategory === '学习' ? 'selected' : ''}>学习</option>
            <option value="其他" ${promptCategory === '其他' ? 'selected' : ''}>其他</option>
          </select>
        </div>
        <div style="margin-bottom: 20px;">
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">标签（用逗号分隔）</label>
          <input type="text" id="prompt-tags" placeholder="标签1, 标签2, 标签3" value="${promptTags}" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
        </div>
        <div style="display: flex; gap: 12px;">
          <button id="save-prompt" style="flex: 1; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">保存</button>
          <button id="cancel-prompt" style="flex: 1; padding: 10px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
        </div>
      </div>
    `;

    // 添加到页面
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    // 绑定事件
    document.getElementById('save-prompt').addEventListener('click', function() {
      savePromptFromDialog(editPrompt);
    });
    document.getElementById('cancel-prompt').addEventListener('click', closeDialog);
    overlay.addEventListener('click', closeDialog);

    // 聚焦到标题输入框
    document.getElementById('prompt-title').focus();

    function savePromptFromDialog(existingPrompt) {
      const title = document.getElementById('prompt-title').value.trim();
      const content = document.getElementById('prompt-content').value.trim();
      const category = document.getElementById('prompt-category').value;
      const tags = document.getElementById('prompt-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

      if (!title || !content) {
        alert('请填写标题和内容');
        return;
      }

      if (existingPrompt) {
        // 编辑现有提示词
        updatePrompt(existingPrompt.id, { title, content, category, tags });
        showNotification('提示词已更新');
      } else {
        // 添加新提示词
        const newPrompt = {
          id: Date.now().toString(),
          title,
          content,
          category,
          tags
        };
        saveNewPrompt(newPrompt);
        showNotification('提示词已保存');
      }
      
      closeDialog();
    }

    function closeDialog() {
      overlay.remove();
      dialog.remove();
    }
  }
  
  // 显示通知
  function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  
  // 保存新提示词
  async function saveNewPrompt(newPrompt) {
    try {
      let prompts = [...allPrompts];
      prompts.push(newPrompt);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ prompts });
      }
      
      allPrompts = prompts;
      filteredPrompts = [...prompts];
      
      // 重新应用当前筛选条件
      if (searchQuery || activeTagFilters.size > 0) {
        applyFilters();
      }
      
      renderTagCloud();
      updateFilterInfo();
    } catch (error) {
      console.error('保存提示词失败:', error);
    }
  }
  
  // 更新提示词
  async function updatePrompt(promptId, updatedData) {
    try {
      let prompts = [...allPrompts];
      const index = prompts.findIndex(p => p.id === promptId);
      
      if (index !== -1) {
        prompts[index] = { ...prompts[index], ...updatedData };
        
        if (typeof chrome !== 'undefined' && chrome.storage) {
          await chrome.storage.local.set({ prompts });
        }
        
        allPrompts = prompts;
        
        // 重新应用当前筛选条件
        if (searchQuery || activeTagFilters.size > 0) {
          applyFilters();
        } else {
          filteredPrompts = [...prompts];
        }
        
        renderTagCloud();
        updateFilterInfo();
      }
    } catch (error) {
      console.error('更新提示词失败:', error);
    }
  }
  
  // 导出数据功能
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  
  // 导出按钮事件
  exportBtn.addEventListener('click', function() {
    exportPrompts();
  });
  
  // 导入按钮事件
  importBtn.addEventListener('click', function() {
    importFile.click();
  });
  
  // 文件选择事件
  importFile.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      importPrompts(file);
    }
  });
  
  // 导出提示词数据
  function exportPrompts() {
    try {
      const exportData = {
        app: 'Prompt管家',
        version: 'v1',
        timestamp: new Date().toISOString(),
        data: allPrompts
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `prompt-manager-export-${new Date().toISOString().split('T')[0]}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('数据导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      showNotification('导出失败，请重试');
    }
  }
  
  // 导入提示词数据
  async function importPrompts(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      // 验证数据格式
      if (!validateImportData(importData)) {
        showNotification('导入失败：数据格式不正确');
        return;
      }
      
      // 显示导入确认对话框
      showImportConfirmDialog(importData);
      
    } catch (error) {
      console.error('导入失败:', error);
      showNotification('导入失败：文件格式错误');
    }
  }
  
  // 验证导入数据格式
  function validateImportData(data) {
    // 检查必需的标识字段
    if (!data.app || data.app !== 'Prompt管家') {
      return false;
    }
    
    // 检查版本字段
    if (!data.version || !data.version.startsWith('v')) {
      return false;
    }
    
    // 检查数据字段
    if (!Array.isArray(data.data)) {
      return false;
    }
    
    // 验证每个提示词的格式
    for (const prompt of data.data) {
      if (!prompt.id || !prompt.title || !prompt.content || 
          !prompt.category || !Array.isArray(prompt.tags)) {
        return false;
      }
    }
    
    return true;
  }
  
  // 显示导入确认对话框
  function showImportConfirmDialog(importData) {
    const existingDialog = document.getElementById('import-confirm-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'import-confirm-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;

    const importCount = importData.data.length;
    const currentCount = allPrompts.length;

    dialog.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">确认导入数据</h3>
      </div>
      <div style="padding: 20px;">
        <div style="margin-bottom: 16px; color: #374151;">
          <p style="margin: 0 0 8px 0;">数据来源：${importData.app}</p>
          <p style="margin: 0 0 8px 0;">版本：${importData.version}</p>
          <p style="margin: 0 0 8px 0;">导入时间：${new Date(importData.timestamp).toLocaleString()}</p>
          <p style="margin: 0 0 16px 0;">将导入 <strong>${importCount}</strong> 个提示词</p>
        </div>
        <div style="margin-bottom: 16px;">
          <label style="display: flex; align-items: center; font-size: 14px; color: #374151;">
            <input type="radio" name="import-mode" value="merge" checked style="margin-right: 8px;">
            合并导入（保留现有 ${currentCount} 个提示词）
          </label>
          <label style="display: flex; align-items: center; font-size: 14px; color: #374151; margin-top: 8px;">
            <input type="radio" name="import-mode" value="replace" style="margin-right: 8px;">
            替换导入（删除现有数据）
          </label>
        </div>
        <div style="display: flex; gap: 12px;">
          <button id="confirm-import" style="flex: 1; padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">确认导入</button>
          <button id="cancel-import" style="flex: 1; padding: 10px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    document.getElementById('confirm-import').addEventListener('click', function() {
      const mode = document.querySelector('input[name="import-mode"]:checked').value;
      executeImport(importData.data, mode);
      closeImportDialog();
    });

    document.getElementById('cancel-import').addEventListener('click', closeImportDialog);
    overlay.addEventListener('click', closeImportDialog);

    function closeImportDialog() {
      overlay.remove();
      dialog.remove();
      // 清空文件选择
      importFile.value = '';
    }
  }
  
  // 显示删除确认对话框
  function showDeleteConfirmDialog(prompt) {
    const existingDialog = document.getElementById('delete-confirm-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'delete-confirm-dialog';
    dialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 350px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
    `;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    `;

    dialog.innerHTML = `
      <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
        <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #dc3545;">⚠️ 确认删除</h3>
      </div>
      <div style="padding: 20px;">
        <p style="margin: 0 0 16px 0; color: #374151;">确定要删除提示词 "<strong>${prompt.title}</strong>" 吗？</p>
        <p style="margin: 0 0 20px 0; color: #6b7280; font-size: 14px;">此操作无法撤销。</p>
        <div style="display: flex; gap: 12px;">
          <button id="confirm-delete" style="flex: 1; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">删除</button>
          <button id="cancel-delete" style="flex: 1; padding: 10px; background: #f3f4f6; color: #374151; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer;">取消</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(dialog);

    document.getElementById('confirm-delete').addEventListener('click', function() {
      deletePrompt(prompt.id);
      closeDeleteDialog();
    });

    document.getElementById('cancel-delete').addEventListener('click', closeDeleteDialog);
    overlay.addEventListener('click', closeDeleteDialog);

    function closeDeleteDialog() {
      overlay.remove();
      dialog.remove();
    }
  }
  
  // 删除提示词
  async function deletePrompt(promptId) {
    try {
      let prompts = allPrompts.filter(p => p.id !== promptId);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ prompts });
      }
      
      allPrompts = prompts;
      
      // 重新应用当前筛选条件
      if (searchQuery || activeTagFilters.size > 0) {
        applyFilters();
      } else {
        filteredPrompts = [...prompts];
      }
      
      renderTagCloud();
      renderPrompts();
      updateFilterInfo();
      
      showNotification('提示词已删除');
    } catch (error) {
      console.error('删除提示词失败:', error);
      showNotification('删除失败，请重试');
    }
  }
  
  // 执行导入
  async function executeImport(importedPrompts, mode) {
    try {
      let newPrompts;
      
      if (mode === 'replace') {
        // 替换模式：直接使用导入的数据
        newPrompts = importedPrompts.map(prompt => ({
          ...prompt,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));
      } else {
        // 合并模式：合并现有数据和导入数据
        const existingIds = new Set(allPrompts.map(p => p.id));
        const mergedPrompts = [...allPrompts];
        
        importedPrompts.forEach(prompt => {
          // 生成新的ID避免冲突
          const newPrompt = {
            ...prompt,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          };
          mergedPrompts.push(newPrompt);
        });
        
        newPrompts = mergedPrompts;
      }
      
      // 保存到存储
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ prompts: newPrompts });
      }
      
      // 更新本地数据
      allPrompts = newPrompts;
      filteredPrompts = [...newPrompts];
      
      // 清除筛选条件
      activeTagFilters.clear();
      searchQuery = '';
      searchBox.value = '';
      
      // 重新渲染界面
      renderTagCloud();
      renderPrompts();
      updateFilterInfo();
      
      const importCount = importedPrompts.length;
      const totalCount = newPrompts.length;
      
      if (mode === 'replace') {
        showNotification(`导入成功！已替换为 ${importCount} 个提示词`);
      } else {
        showNotification(`导入成功！已合并 ${importCount} 个提示词，当前共 ${totalCount} 个`);
      }
      
    } catch (error) {
      console.error('执行导入失败:', error);
      showNotification('导入失败，请重试');
    }
  }
  
  // 初始化
  loadPrompts();
});
