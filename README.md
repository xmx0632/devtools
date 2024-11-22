# DevTools 浏览器扩展

一个功能强大的浏览器扩展，提供各种编码和加密工具。

## 功能特性

- 编码/解码工具
  - Base64（支持 UTF-8、ASCII、GBK）
  - URL 编码
  - Unicode 转换
  - HTML 实体编码

- 加密工具
  - AES-GCM 加密/解密
    - 256 位密钥长度
    - PBKDF2 密钥派生
    - 支持随机和确定性盐值
    - Base64 编码输出

- 摘要工具
  - MD5 摘要（支持 16位、32位、128位）
  - SHA-1 摘要
  - SHA-256 摘要

## 构建说明

1. 确保系统已安装以下工具：
   - bash
   - zip

2. 运行打包脚本：
   ```bash
   ./build.sh
   ```

3. 打包后的文件位于 `build` 目录下

## 安装说明

1. 在 Chrome 浏览器中打开 `chrome://extensions/`
2. 开启右上角的"开发者模式"
3. 选择"加载已解压的扩展程序"
4. 选择 `build` 目录（如果使用 zip 文件需要先解压）

## 使用说明

1. 点击扩展图标打开工具面板
2. 选择左侧要使用的工具
3. 在输入框中输入要处理的文本
4. 根据工具类型：
   - 编码工具：选择编码方式和编码/解码模式
   - AES 加密：输入密钥，选择是否使用随机盐值
   - MD5 摘要：选择输出长度（16位/32位/128位）
5. 处理结果会自动显示在输出框中
6. 点击"复制"按钮可复制输出结果

## 开发说明

- 扩展使用 Manifest V3
- 使用 Web Crypto API 进行加密操作
- 支持多种字符编码（使用 TextEncoder/TextDecoder）

## 注意事项

- AES 加密默认使用随机盐值，这样更安全但相同输入会产生不同输出
- 可以关闭随机盐值，这样相同的输入和密钥会产生相同的输出
- MD5 默认使用 32 位输出
- 建议使用 Chrome 最新版本以获得最佳体验
