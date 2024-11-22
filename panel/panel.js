document.addEventListener('DOMContentLoaded', () => {
    // Tool selection
    const toolButtons = document.querySelectorAll('.tool-btn');
    const toolHeader = document.querySelector('.tool-header h2');
    const inputArea = document.querySelector('.input-area');
    const outputArea = document.querySelector('.output-area');
    const encodingSelect = document.querySelector('.encoding-select');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const keyInput = document.querySelector('.key-input');

    // 工具选择
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const isDigest = ['MD5', 'SHA1', 'SHA256'].includes(button.textContent);
            toolHeader.textContent = button.textContent + (isDigest ? ' 摘要' : ' 编码/解码');
            
            // 显示/隐藏密钥输入框
            keyInput.style.display = button.textContent === 'AES' ? 'inline-block' : 'none';
            
            // 更新编码选择框的显示
            encodingSelect.style.display = ['Base64', 'Unicode'].includes(button.textContent) ? 'inline-block' : 'none';
            
            // 对于摘要算法，隐藏模式切换按钮
            const modeSwitch = document.querySelector('.mode-switch');
            modeSwitch.style.display = isDigest ? 'none' : 'flex';
            
            processInput();
        });
    });

    // 模式切换（编码/解码）
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            processInput();
        });
    });

    // 输入变化时处理
    inputArea.addEventListener('input', () => processInput());
    encodingSelect.addEventListener('change', () => processInput());

    // 处理输入
    async function processInput() {
        const input = inputArea.value;
        if (!input) {
            outputArea.value = '';
            return;
        }

        const encoding = encodingSelect.value;
        const mode = document.querySelector('.mode-btn.active').textContent;
        const tool = document.querySelector('.tool-btn.active').textContent;

        try {
            let result = '';
            if (tool === 'Base64') {
                result = handleBase64(input, mode, encoding);
            } else if (tool === 'URL') {
                result = handleURL(input, mode);
            } else if (tool === 'Unicode') {
                result = handleUnicode(input, mode);
            } else if (tool === 'HTML') {
                result = handleHTML(input, mode);
            } else if (tool === 'AES') {
                result = await handleAES(input, mode, keyInput.value);
            } else if (tool === 'MD5') {
                result = await handleDigest(input, 'SHA-256'); // 使用 SHA-256 代替 MD5
            } else if (tool === 'SHA1') {
                result = await handleDigest(input, 'SHA-1');
            } else if (tool === 'SHA256') {
                result = await handleDigest(input, 'SHA-256');
            }
            
            outputArea.value = result;
            outputArea.classList.remove('error');
        } catch (error) {
            outputArea.value = '错误: ' + error.message;
            outputArea.classList.add('error');
        }
    }

    // Base64 处理
    function handleBase64(input, mode, encoding) {
        if (mode === '编码') {
            try {
                if (encoding === 'UTF-8') {
                    return btoa(unescape(encodeURIComponent(input)));
                } else if (encoding === 'ASCII') {
                    return btoa(input);
                } else if (encoding === 'GBK') {
                    const encoder = new TextEncoder();
                    const bytes = encoder.encode(input);
                    return btoa(String.fromCharCode.apply(null, bytes));
                }
            } catch (e) {
                throw new Error('编码失败：' + e.message);
            }
        } else { // 解码
            try {
                const base64Str = atob(input.trim());
                if (encoding === 'UTF-8') {
                    return decodeURIComponent(escape(base64Str));
                } else if (encoding === 'ASCII') {
                    return base64Str;
                } else if (encoding === 'GBK') {
                    const bytes = new Uint8Array(base64Str.length);
                    for (let i = 0; i < base64Str.length; i++) {
                        bytes[i] = base64Str.charCodeAt(i);
                    }
                    const decoder = new TextDecoder();
                    return decoder.decode(bytes);
                }
            } catch (e) {
                throw new Error('无效的 Base64 字符串');
            }
        }
    }

    // URL 处理
    function handleURL(input, mode) {
        try {
            if (mode === '编码') {
                return encodeURIComponent(input);
            } else {
                return decodeURIComponent(input);
            }
        } catch (e) {
            throw new Error('URL 处理失败：' + e.message);
        }
    }

    // Unicode 处理
    function handleUnicode(input, mode) {
        try {
            if (mode === '编码') {
                // 将字符串转换为 Unicode 转义序列
                return input.split('').map(char => {
                    const code = char.charCodeAt(0);
                    // 对于 ASCII 可打印字符（空格到~），保持原样
                    if (code >= 32 && code <= 126) {
                        return char;
                    }
                    // 对于其他字符，转换为 \uXXXX 格式
                    return '\\u' + code.toString(16).padStart(4, '0');
                }).join('');
            } else {
                // 解码 Unicode 转义序列
                return input.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
                    return String.fromCharCode(parseInt(hex, 16));
                });
            }
        } catch (e) {
            throw new Error('Unicode 处理失败：' + e.message);
        }
    }

    // HTML 处理
    function handleHTML(input, mode) {
        // HTML 特殊字符映射表
        const htmlEntities = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;',
            ' ': '&nbsp;',
            '¢': '&cent;',
            '£': '&pound;',
            '¥': '&yen;',
            '€': '&euro;',
            '©': '&copy;',
            '®': '&reg;'
        };

        const reverseHtmlEntities = Object.fromEntries(
            Object.entries(htmlEntities).map(([key, value]) => [value, key])
        );

        try {
            if (mode === '编码') {
                // 编码：将特殊字符转换为 HTML 实体
                return input.replace(/[&<>"'`=\/ £¥€©®¢]/g, char => htmlEntities[char] || char);
            } else {
                // 解码：将 HTML 实体转换回特殊字符
                // 处理命名实体
                let result = input;
                Object.entries(reverseHtmlEntities).forEach(([entity, char]) => {
                    result = result.replace(new RegExp(entity, 'g'), char);
                });
                
                // 处理数字实体（十进制和十六进制）
                result = result.replace(/&#(\d+);/g, (match, dec) => {
                    return String.fromCharCode(parseInt(dec, 10));
                }).replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
                    return String.fromCharCode(parseInt(hex, 16));
                });
                
                return result;
            }
        } catch (e) {
            throw new Error('HTML 处理失败：' + e.message);
        }
    }

    // AES 处理
    async function handleAES(input, mode, key) {
        if (!key) {
            throw new Error('请输入密钥');
        }

        try {
            if (mode === '编码') {
                // 生成随机盐值和 IV
                const salt = crypto.getRandomValues(new Uint8Array(16));
                const iv = crypto.getRandomValues(new Uint8Array(12));

                // 从密钥生成加密密钥
                const keyMaterial = await crypto.subtle.importKey(
                    'raw',
                    new TextEncoder().encode(key),
                    { name: 'PBKDF2' },
                    false,
                    ['deriveBits', 'deriveKey']
                );

                const cryptoKey = await crypto.subtle.deriveKey(
                    {
                        name: 'PBKDF2',
                        salt: salt,
                        iterations: 100000,
                        hash: 'SHA-256'
                    },
                    keyMaterial,
                    { name: 'AES-GCM', length: 256 },
                    false,
                    ['encrypt']
                );

                // 加密数据
                const encryptedData = await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv: iv },
                    cryptoKey,
                    new TextEncoder().encode(input)
                );

                // 组合 salt + iv + 密文
                const resultArray = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
                resultArray.set(salt, 0);
                resultArray.set(iv, salt.length);
                resultArray.set(new Uint8Array(encryptedData), salt.length + iv.length);

                // 转换为 Base64
                return btoa(String.fromCharCode(...resultArray));
            } else {
                try {
                    // 解码 Base64
                    const encryptedArray = new Uint8Array(
                        atob(input).split('').map(char => char.charCodeAt(0))
                    );

                    // 提取 salt、iv 和密文
                    const salt = encryptedArray.slice(0, 16);
                    const iv = encryptedArray.slice(16, 28);
                    const encryptedData = encryptedArray.slice(28);

                    // 从密钥生成解密密钥
                    const keyMaterial = await crypto.subtle.importKey(
                        'raw',
                        new TextEncoder().encode(key),
                        { name: 'PBKDF2' },
                        false,
                        ['deriveBits', 'deriveKey']
                    );

                    const cryptoKey = await crypto.subtle.deriveKey(
                        {
                            name: 'PBKDF2',
                            salt: salt,
                            iterations: 100000,
                            hash: 'SHA-256'
                        },
                        keyMaterial,
                        { name: 'AES-GCM', length: 256 },
                        false,
                        ['decrypt']
                    );

                    // 解密
                    const decryptedData = await crypto.subtle.decrypt(
                        { name: 'AES-GCM', iv: iv },
                        cryptoKey,
                        encryptedData
                    );

                    // 转换为文本
                    return new TextDecoder().decode(decryptedData);
                } catch (e) {
                    throw new Error('解密失败：密钥错误或数据已损坏');
                }
            }
        } catch (e) {
            if (mode === '解码' && e.message.includes('解密失败')) {
                throw e;
            }
            throw new Error('AES 处理失败：' + e.message);
        }
    }

    // 通用摘要处理函数
    async function handleDigest(input, algorithm) {
        try {
            // 计算摘要
            const msgBuffer = new TextEncoder().encode(input);
            const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            // 添加格式化的输出
            const chunks = hashHex.match(/.{8}/g) || [];
            return chunks.join(' ');
        } catch (e) {
            throw new Error(`${algorithm} 计算失败：` + e.message);
        }
    }

    // 清空按钮
    const clearBtn = document.querySelector('.clear-btn');
    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
        outputArea.classList.remove('error');
    });

    // 复制按钮
    const copyBtn = document.querySelector('.copy-btn');
    copyBtn.addEventListener('click', () => {
        if (outputArea.value && !outputArea.classList.contains('error')) {
            outputArea.select();
            document.execCommand('copy');
            
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制';
            copyBtn.style.backgroundColor = '#198754';
            copyBtn.style.color = 'white';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.backgroundColor = '';
                copyBtn.style.color = '';
            }, 1500);
        }
    });
});