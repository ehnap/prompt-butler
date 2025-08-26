// 内容脚本 - 处理页面交互和文本插入

// 创建添加提示词的对话框
function createAddDialog(selectedText) {
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

  // 对话框内容
  dialog.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #e5e7eb;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">添加到Prompt管家</h3>
    </div>
    <div style="padding: 20px;">
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">标题</label>
        <input type="text" id="prompt-title" placeholder="输入提示词标题" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">内容</label>
        <textarea id="prompt-content" rows="4" placeholder="输入提示词内容" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; resize: vertical; box-sizing: border-box;">${selectedText}</textarea>
      </div>
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">分类</label>
        <select id="prompt-category" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
          <option value="编程">编程</option>
          <option value="写作">写作</option>
          <option value="翻译">翻译</option>
          <option value="产品">产品</option>
          <option value="学习">学习</option>
          <option value="其他">其他</option>
        </select>
      </div>
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #374151;">标签（用逗号分隔）</label>
        <input type="text" id="prompt-tags" placeholder="标签1, 标签2, 标签3" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
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
  document.getElementById('save-prompt').addEventListener('click', savePrompt);
  document.getElementById('cancel-prompt').addEventListener('click', closeDialog);
  overlay.addEventListener('click', closeDialog);

  // 聚焦到标题输入框
  document.getElementById('prompt-title').focus();

  function savePrompt() {
    const title = document.getElementById('prompt-title').value.trim();
    const content = document.getElementById('prompt-content').value.trim();
    const category = document.getElementById('prompt-category').value;
    const tags = document.getElementById('prompt-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);

    if (!title || !content) {
      alert('请填写标题和内容');
      return;
    }

    const newPrompt = {
      id: Date.now().toString(),
      title,
      content,
      category,
      tags
    };

    // 发送消息给background script保存提示词
    chrome.runtime.sendMessage({
      action: 'saveNewPrompt',
      title: title,
      content: content,
      category: category,
      tags: tags
    }, (response) => {
      if (response && response.success) {
        closeDialog();
        showNotification('提示词已保存到Prompt管家');
      } else {
        alert('保存失败，请重试');
      }
    });
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

// 查找并聚焦到输入框
function findAndFocusInput() {
  // 常见的输入框选择器
  const inputSelectors = [
    'textarea[placeholder*="输入"]',
    'textarea[placeholder*="请输入"]',
    'textarea[placeholder*="问"]',
    'input[type="text"][placeholder*="输入"]',
    'input[type="text"][placeholder*="请输入"]',
    'input[type="text"][placeholder*="问"]',
    '[contenteditable="true"]',
    'textarea:not([readonly]):not([disabled])',
    'input[type="text"]:not([readonly]):not([disabled])'
  ];

  for (const selector of inputSelectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      // 检查元素是否可见
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        return element;
      }
    }
  }
  
  return null;
}

// 插入文本到输入框
function insertTextToInput(text) {
  const inputElement = findAndFocusInput();
  
  if (inputElement) {
    // 聚焦到输入框
    inputElement.focus();
    
    // 根据元素类型插入文本
    if (inputElement.contentEditable === 'true') {
      // 对于contenteditable元素
      inputElement.textContent = text;
      // 触发input事件
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      // 对于input和textarea元素
      inputElement.value = text;
      // 触发input和change事件
      inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      inputElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 设置光标到文本末尾
    if (inputElement.setSelectionRange) {
      inputElement.setSelectionRange(text.length, text.length);
    }
    
    showNotification('提示词已插入到输入框');
  } else {
    // 如果找不到输入框，复制到剪贴板
    navigator.clipboard.writeText(text).then(() => {
      showNotification('未找到输入框，提示词已复制到剪贴板');
    }).catch(() => {
      showNotification('插入失败，请手动粘贴');
    });
  }
}

// Content script初始化标记
let isContentScriptReady = false;

// 初始化content script
function initializeContentScript() {
  if (isContentScriptReady) return;
  
  console.log('Content script正在初始化...');
  isContentScriptReady = true;
  
  // 通知background script已准备就绪
  chrome.runtime.sendMessage({ action: 'contentScriptReady' }).catch(() => {
    // 忽略错误，可能background script还没准备好
  });
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script收到消息:', request);
  
  // 处理ping请求（用于检查content script是否已加载）
  if (request.action === 'ping') {
    sendResponse({ success: true, ready: isContentScriptReady });
    return true;
  }
  
  if (request.action === 'showAddDialog') {
    try {
      createAddDialog(request.selectedText);
      sendResponse({ success: true });
    } catch (error) {
      console.error('创建对话框失败:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  if (request.action === 'insertText') {
    try {
      insertTextToInput(request.text);
      sendResponse({ success: true });
    } catch (error) {
      console.error('插入文本失败:', error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  }
  
  // 默认响应
  sendResponse({ success: false, error: '未知操作' });
  return false;
});

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeContentScript);
} else {
  initializeContentScript();
}

// 确保在页面完全加载后也初始化一次
window.addEventListener('load', initializeContentScript);
