// 存储当前打开的窗口ID
let windowId = null;

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  if (windowId === null) {
    // 获取屏幕尺寸
    chrome.windows.getLastFocused(async (parentWindow) => {
      // 计算新窗口位置（靠右显示）
      const width = 800;
      const height = 600;
      const top = Math.max(parentWindow.top, 0);
      // 将窗口放在右侧，留出一定边距
      const left = Math.max(parentWindow.left + parentWindow.width - width - 20, 0);

      // 创建新窗口
      const window = await chrome.windows.create({
        url: 'panel/panel.html',
        type: 'popup',
        width: width,
        height: height,
        left: left,
        top: top
      });
      
      windowId = window.id;
    });
  } else {
    // 如果窗口已经存在，就激活它
    chrome.windows.update(windowId, {
      focused: true
    });
  }
});

// 监听窗口关闭事件
chrome.windows.onRemoved.addListener((removedWindowId) => {
  if (removedWindowId === windowId) {
    windowId = null;
  }
});
