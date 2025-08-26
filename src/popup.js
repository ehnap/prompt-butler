// Chrome插件通信脚本
console.log('Chrome插件popup通信脚本已加载');

// Chrome插件API封装
window.chromeExtensionAPI = {
  // 获取提示词
  async getPrompts() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['prompts']);
        return result.prompts || [];
      }
      return [];
    } catch (error) {
      console.error('获取提示词失败:', error);
      return [];
    }
  },
  
  // 保存提示词
  async savePrompts(prompts) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ prompts });
        return true;
      }
      return false;
    } catch (error) {
      console.error('保存提示词失败:', error);
      return false;
    }
  },
  
  // 插入提示词
  async insertPrompt(content) {
    try {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (text) => {
            let activeElement = document.activeElement;
            
            if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA' && !activeElement.contentEditable)) {
              const inputs = document.querySelectorAll('input[type="text"], input[type="search"], input[type="email"], textarea, [contenteditable="true"]');
              if (inputs.length > 0) {
                activeElement = inputs[0];
                activeElement.focus();
              }
            }
            
            if (activeElement) {
              if (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA') {
                activeElement.value = text;
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                activeElement.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (activeElement.contentEditable === 'true') {
                activeElement.textContent = text;
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
              }
            }
          },
          args: [content]
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('插入提示词失败:', error);
      return false;
    }
  }
};