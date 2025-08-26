// 背景脚本 - 处理右键菜单和消息传递

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "addToPromptManager",
    title: "添加到Prompt管家",
    contexts: ["selection"]
  });
});

// 确保content script已加载
async function ensureContentScriptLoaded(tabId) {
  try {
    // 尝试ping content script
    await chrome.tabs.sendMessage(tabId, { action: "ping" });
  } catch (error) {
    // 如果失败，注入content script
    console.log('Content script未加载，正在注入...');
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
    // 等待一小段时间让content script初始化
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "addToPromptManager" && info.selectionText) {
    try {
      // 确保content script已加载
      await ensureContentScriptLoaded(tab.id);
      
      // 向content script发送消息，显示添加对话框
      chrome.tabs.sendMessage(tab.id, {
        action: "showAddDialog",
        selectedText: info.selectionText
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('发送消息失败:', chrome.runtime.lastError);
        } else {
          console.log('消息发送成功:', response);
        }
      });
    } catch (error) {
      console.error('处理右键菜单点击失败:', error);
    }
  }
});

// 处理来自popup和content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background收到消息:', request);
  
  if (request.action === "getPrompts") {
    // 从存储中获取提示词
    chrome.storage.local.get(["prompts"], (result) => {
      console.log('获取到的提示词:', result.prompts);
      sendResponse({ prompts: result.prompts || [] });
    });
    return true; // 保持消息通道开放
  }
  
  if (request.action === "savePrompts") {
    // 保存提示词到存储
    chrome.storage.local.set({ prompts: request.prompts }, () => {
      console.log('提示词已保存');
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === "saveNewPrompt") {
    // 保存新提示词
    chrome.storage.local.get(["prompts"], (result) => {
      const prompts = result.prompts || [];
      const newPrompt = {
        id: Date.now().toString(),
        title: request.title,
        content: request.content,
        tags: request.tags || [],
        category: request.category || '自定义',
        createdAt: new Date().toISOString()
      };
      prompts.push(newPrompt);
      
      chrome.storage.local.set({ prompts }, () => {
        console.log('新提示词已保存:', newPrompt);
        sendResponse({ success: true, prompt: newPrompt });
      });
    });
    return true;
  }
  
  if (request.action === "insertPrompt") {
    // 向当前活动标签页插入提示词
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "insertText",
          text: request.text
        }, (response) => {
          console.log('插入响应:', response);
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false, error: '未找到活动标签页' });
      }
    });
    return true;
  }
  
  // 默认响应
  sendResponse({ success: false, error: '未知操作' });
  return false;
});
