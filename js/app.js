// 数据管理
const StorageKeys = {
    USER: 'site_user',
    LIFE: 'site_life',
    WORKS: 'site_works',
    THEME: 'site_theme',
    AVATAR: 'site_avatar',
    USER_COUNT: 'site_user_count'
};

// 主题配置
const Themes = {
    'default': { name: '默认', color: '#1a1a1a' },
    'black': { name: '纯黑', color: '#000000' },
    'blue': { name: '蓝色', color: '#0066cc' },
    'green': { name: '绿色', color: '#00a854' },
    'purple': { name: '紫色', color: '#722ed1' },
    'orange': { name: '橙色', color: '#fa8c16' },
    'red': { name: '红色', color: '#f5222d' },
    'teal': { name: '青色', color: '#13c2c2' },
    
    'cs1': { name: '长沙1号线', color: '#E60012' },
    'cs2': { name: '长沙2号线', color: '#00AFEC' },
    'cs3': { name: '长沙3号线', color: '#ABCD03' },
    'cs4': { name: '长沙4号线', color: '#920783' },
    'cs5': { name: '长沙5号线', color: '#FFE200' },
    'cs6': { name: '长沙6号线', color: '#005BAC' },
    
    'gz1': { name: '广州1号线', color: '#edcf3b' },
    'gz2': { name: '广州2号线', color: '#00679e' },
    'gz3': { name: '广州3号线', color: '#e89e47' },
    'gz4': { name: '广州4号线', color: '#01824a' },
    'gz5': { name: '广州5号线', color: '#c70541' },
    'gz6': { name: '广州6号线', color: '#6e0346' },
    'gz7': { name: '广州7号线', color: '#9dd32d' },
    'gz8': { name: '广州8号线', color: '#00858a' },
    'gz9': { name: '广州9号线', color: '#5ec998' },
    'gz10': { name: '广州10号线', color: '#6e90b6' },
    'gz11': { name: '广州11号线', color: '#F5BB17' },
    'gz12': { name: '广州12号线', color: '#59621d' },
    'gz13': { name: '广州13号线', color: '#888600' },
    'gz14': { name: '广州14号线', color: '#792720' },
};

// Emoji 列表
const Emojis = [
    '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😜', '🤪', '🤔',
    '😎', '🥳', '😢', '😭', '😤', '😡', '🥺', '😴', '🤯', '🥶',
    '👍', '👎', '👏', '🙌', '🙏', '💪', '🤝', '✌️', '🤞', '👌',
    '❤️', '💔', '💕', '💖', '💗', '💯', '✨', '🔥', '🎉', '🎊',
    '🌟', '⭐', '☀️', '🌙', '☁️', '🌈', '🌸', '🌺', '🍀', '🌿',
    '🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍑', '🥭', '🍍', '🥝',
    '🍔', '🍟', '🍕', '🌮', '🍜', '🍝', '🍣', '🍱', '🥟', '🍦',
    '🍰', '🎂', '🍭', '🍬', '🍫', '🍿', '☕', '🍵', '🧃', '🍺',
    '📷', '📸', '🎨', '🎭', '🎪', '🎢', '🎡', '🎠', '🎮', '🎲',
    '✈️', '🚗', '🚕', '🚙', '🚌', '🚇', '🚄', '🚲', '🏍️', '🚀',
    '🏠', '🏡', '🏫', '🏢', '🏥', '🏦', '🏨', '🏪', '⛪',
    '🌊', '🏖️', '🏝️', '🏔️', '⛰️', '🌋', '🏜️', '🏞️', '🌅', '🌄'
];

const DEFAULT_AVATAR = '';

let currentUser = null;
let isLoginMode = false;
let currentTheme = 'default';
let tempImageData = null;
let currentAvatar = DEFAULT_AVATAR;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadTheme();
    initEmojiPicker();
});

// 生成用户ID：NYS-Kn001 格式
function generateUserId() {
    let count = parseInt(localStorage.getItem(StorageKeys.USER_COUNT) || '0');
    count++;
    localStorage.setItem(StorageKeys.USER_COUNT, count.toString());
    return 'NYS-Kn' + count.toString().padStart(3, '0');
}

function checkAuth() {
    const savedUser = localStorage.getItem(StorageKeys.USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        loadAvatar();
        showMainScreen();
    }
}

function setupEventListeners() {
    document.getElementById('auth-form').addEventListener('submit', handleAuth);
    document.getElementById('auth-switch-btn').addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthMode();
    });
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('theme-btn').addEventListener('click', openThemeModal);
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });
}

// Emoji 选择器
function initEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (!picker) return;
    picker.innerHTML = Emojis.map(e => 
        `<span class="emoji-item" onclick="insertEmoji('${e}')">${e}</span>`
    ).join('');
}

function insertEmoji(emoji) {
    const textarea = document.getElementById('item-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + emoji + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
}

// 头像管理
function loadAvatar() {
    const saved = localStorage.getItem(StorageKeys.AVATAR);
    currentAvatar = saved || DEFAULT_AVATAR;
    updateAvatarDisplay();
}

function updateAvatarDisplay() {
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
        if (currentAvatar) {
            navAvatar.innerHTML = `<img src="${currentAvatar}" alt="avatar">`;
        } else {
            navAvatar.innerHTML = `<div class="nav-avatar-text">${currentUser.username.charAt(0).toUpperCase()}</div>`;
        }
    }
    
    const settingsAvatar = document.getElementById('current-avatar');
    if (settingsAvatar) {
        if (currentAvatar) {
            settingsAvatar.src = currentAvatar;
            settingsAvatar.style.display = 'block';
        } else {
            settingsAvatar.style.display = 'none';
        }
    }
}

function changeAvatar(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        currentAvatar = event.target.result;
        localStorage.setItem(StorageKeys.AVATAR, currentAvatar);
        updateAvatarDisplay();
        loadFeed();
        alert('头像已更新');
    };
    reader.readAsDataURL(file);
}

function resetAvatar() {
    currentAvatar = DEFAULT_AVATAR;
    localStorage.removeItem(StorageKeys.AVATAR);
    updateAvatarDisplay();
    loadFeed();
    alert('已恢复默认头像');
}

// 修改用户名
function changeUsername(e) {
    e.preventDefault();
    const newUsername = document.getElementById('new-username').value.trim();
    const errorEl = document.getElementById('username-error');
    const successEl = document.getElementById('username-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (newUsername.length < 2) {
        errorEl.textContent = '用户名至少2个字符';
        return;
    }
    
    currentUser.username = newUsername;
    localStorage.setItem(StorageKeys.USER, JSON.stringify(currentUser));
    
    document.getElementById('nav-username').textContent = newUsername;
    document.getElementById('settings-username').textContent = newUsername;
    updateAvatarDisplay();
    loadFeed();
    
    successEl.textContent = '用户名修改成功';
    document.getElementById('username-form').reset();
    
    setTimeout(() => {
        successEl.textContent = '';
    }, 3000);
}

// 修改密码
function changePassword(e) {
    e.preventDefault();
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-new-password').value;
    const errorEl = document.getElementById('password-error');
    const successEl = document.getElementById('password-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (hashPassword(oldPassword) !== currentUser.password) {
        errorEl.textContent = '当前密码不正确';
        return;
    }
    
    if (newPassword.length < 4) {
        errorEl.textContent = '新密码至少4位';
        return;
    }
    
    if (newPassword !== confirmPassword) {
        errorEl.textContent = '两次新密码不一致';
        return;
    }
    
    currentUser.password = hashPassword(newPassword);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(currentUser));
    
    successEl.textContent = '密码修改成功';
    document.getElementById('password-form').reset();
    
    setTimeout(() => {
        successEl.textContent = '';
    }, 3000);
}

// 主题管理
function loadTheme() {
    const saved = localStorage.getItem(StorageKeys.THEME) || 'default';
    currentTheme = saved;
    applyTheme(saved);
}

function applyTheme(themeKey) {
    const theme = Themes[themeKey] || Themes.default;
    document.documentElement.style.setProperty('--accent', theme.color);
    currentTheme = themeKey;
    localStorage.setItem(StorageKeys.THEME, themeKey);
}

function openThemeModal() {
    const modal = document.getElementById('theme-modal');
    renderThemeGrid('basic-themes', ['default', 'black', 'blue', 'green', 'purple', 'orange', 'red', 'teal']);
    renderThemeGrid('changsha-themes', ['cs1', 'cs2', 'cs3', 'cs4', 'cs5', 'cs6']);
    renderThemeGrid('guangzhou-themes', ['gz1', 'gz2', 'gz3', 'gz4', 'gz5', 'gz6', 'gz7', 'gz8', 'gz9', 'gz10', 'gz11', 'gz12', 'gz13', 'gz14']);
    modal.classList.add('show');
}

function renderThemeGrid(containerId, themeKeys) {
    const container = document.getElementById(containerId);
    container.innerHTML = themeKeys.map(key => {
        const theme = Themes[key];
        const selected = key === currentTheme ? 'selected' : '';
        return `<div class="theme-item ${selected}" style="background:${theme.color}" onclick="selectTheme('${key}')" title="${theme.name}"></div>`;
    }).join('');
}

function selectTheme(key) {
    applyTheme(key);
    openThemeModal();
}

function closeThemeModal(e) {
    if (e && e.target !== document.getElementById('theme-modal')) return;
    document.getElementById('theme-modal').classList.remove('show');
}

// 切换登录/注册模式
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const confirmGroup = document.getElementById('confirm-group');
    const authBtn = document.querySelector('.auth-btn');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');
    const title = document.querySelector('.auth-title');
    
    if (isLoginMode) {
        confirmGroup.style.display = 'none';
        authBtn.textContent = '登录';
        switchText.textContent = '还没有账号？';
        switchBtn.textContent = '立即注册';
        title.textContent = '欢迎回来';
    } else {
        confirmGroup.style.display = 'block';
        authBtn.textContent = '创建账号';
        switchText.textContent = '已有账号？';
        switchBtn.textContent = '直接登录';
        title.textContent = '欢迎来到我的空间';
    }
    document.getElementById('auth-error').textContent = '';
}

// 处理注册/登录
function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!username) { errorEl.textContent = '请输入名称'; return; }
    if (!password) { errorEl.textContent = '请输入密码'; return; }
    
    if (!isLoginMode) {
        if (password.length < 4) { errorEl.textContent = '密码至少4位'; return; }
        if (password !== confirmPassword) { errorEl.textContent = '两次密码不一致'; return; }
        
        const userId = generateUserId();
        const user = { 
            username, 
            userId,
            password: hashPassword(password), 
            createdAt: new Date().toISOString() 
        };
        localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
        currentUser = user;
        loadAvatar();
        showMainScreen();
    } else {
        const savedUser = localStorage.getItem(StorageKeys.USER);
        if (!savedUser) { errorEl.textContent = '账号不存在'; return; }
        const user = JSON.parse(savedUser);
        if (user.username !== username) { errorEl.textContent = '名称不正确'; return; }
        if (user.password !== hashPassword(password)) { errorEl.textContent = '密码错误'; return; }
        currentUser = user;
        loadAvatar();
        showMainScreen();
    }
}

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// 显示主界面
function showMainScreen() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
    
    document.getElementById('nav-username').textContent = currentUser.username;
    document.getElementById('nav-userid').textContent = currentUser.userId || 'NYS-Kn000';
    
    document.getElementById('settings-username').textContent = currentUser.username;
    document.getElementById('settings-userid').textContent = currentUser.userId || 'NYS-Kn000';
    document.getElementById('settings-created').textContent = new Date(currentUser.createdAt).toLocaleDateString('zh-CN');
    
    updateAvatarDisplay();
    loadData();
}

// 退出登录
function logout() {
    if (confirm('确定要退出吗？')) {
        currentUser = null;
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('auth-form').reset();
    }
}

// 切换页面
function switchPage(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === 'page-' + pageName);
    });
}

// 加载数据
function loadData() {
    loadFeed();
    loadLifeRecords();
    loadWorks();
}

// 加载朋友圈
function loadFeed() {
    const allItems = [
        ...getLifeRecords().map(r => ({ ...r, type: 'life' })),
        ...getWorks().map(w => ({ ...w, type: 'work' }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20);
    
    const container = document.getElementById('feed-list');
    const emptyState = document.getElementById('feed-empty');
    
    if (allItems.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = allItems.map(item => createFeedItem(item)).join('');
}

// 创建朋友圈条目
function createFeedItem(item) {
    const date = new Date(item.date).toLocaleDateString('zh-CN');
    const typeName = item.type === 'life' ? '生活' : '作品';
    const imageHtml = item.image ? `<div class="feed-image"><img src="${item.image}" alt=""></div>` : '';
    const tags = item.tags ? item.tags.map(t => `<span class="feed-tag">#${t}</span>`).join('') : '';
    
    const avatarHtml = currentAvatar 
        ? `<img src="${currentAvatar}" alt="avatar">`
        : `<div class="feed-avatar-text">${currentUser.username.charAt(0).toUpperCase()}</div>`;
    
    return `
        <div class="feed-item">
            <div class="feed-header">
                <div class="feed-avatar">${avatarHtml}</div>
                <div class="feed-info">
                    <div class="feed-author">${escapeHtml(currentUser.username)}</div>
                    <div class="feed-user-id">${currentUser.userId || ''}</div>
                    <div class="feed-time">${date}</div>
                </div>
                <span class="feed-type ${item.type}">${typeName}</span>
            </div>
            <div class="feed-content">
                <div class="feed-title">${escapeHtml(item.title)}</div>
                <div class="feed-text">${escapeHtml(item.content)}</div>
                ${imageHtml}
                ${tags ? `<div class="feed-tags">${tags}</div>` : ''}
            </div>
            <div class="feed-actions">
                <button class="feed-action" onclick="shareToWeChat('${item.id}', '${item.type}')">📤 分享到微信</button>
                <button class="feed-action" onclick="editItem('${item.type}', '${item.id}')">✏️ 编辑</button>
                <button class="feed-action delete" onclick="deleteItem('${item.type}', '${item.id}')">🗑️ 删除</button>
            </div>
        </div>
    `;
}

// 加载生活记录
function loadLifeRecords() {
    const records = getLifeRecords();
    const container = document.getElementById('life-list');
    const emptyState = document.getElementById('life-empty');
    
    if (records.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = records.map(r => createCard(r, 'life')).join('');
}

// 加载作品
function loadWorks() {
    const works = getWorks();
    const container = document.getElementById('works-list');
    const emptyState = document.getElementById('works-empty');
    
    if (works.length === 0) {
        container.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = works.map(w => createCard(w, 'work')).join('');
}

// 创建卡片
function createCard(item, type) {
    const date = new Date(item.date).toLocaleDateString('zh-CN');
    const imageHtml = item.image ? `<div class="card-image"><img src="${item.image}" alt=""></div>` : '';
    const tags = item.tags ? item.tags.map(t => `<span class="tag">${t}</span>`).join('') : '';
    
    return `
        <div class="card" onclick="viewItem('${type}', '${item.id}')">
            <div class="card-date">${date}</div>
            <div class="card-title">${escapeHtml(item.title)}</div>
            <div class="card-content">${escapeHtml(item.content)}</div>
            ${imageHtml}
            ${tags ? `<div class="card-tags">${tags}</div>` : ''}
            <div class="card-actions" onclick="event.stopPropagation()">
                <button onclick="shareToWeChat('${item.id}', '${type}')">分享</button>
                <button onclick="editItem('${type}', '${item.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteItem('${type}', '${item.id}')">删除</button>
            </div>
        </div>
    `;
}

// 获取数据
function getLifeRecords() {
    const data = localStorage.getItem(StorageKeys.LIFE);
    return data ? JSON.parse(data) : [];
}

function getWorks() {
    const data = localStorage.getItem(StorageKeys.WORKS);
    return data ? JSON.parse(data) : [];
}

// 图片预览
function previewImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        tempImageData = event.target.result;
        document.getElementById('image-preview').innerHTML = `<img src="${tempImageData}" alt="预览">`;
    };
    reader.readAsDataURL(file);
}

// 打开弹窗
function openModal(type, itemId = null) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('modal-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    tempImageData = null;
    document.getElementById('image-preview').innerHTML = '';
    document.getElementById('item-type').value = type;
    document.getElementById('item-id').value = itemId || '';
    
    title.textContent = itemId ? '编辑' : (type === 'life' ? '新建生活记录' : '添加作品');
    document.getElementById('item-date').valueAsDate = new Date();
    
    if (itemId) {
        const items = type === 'life' ? getLifeRecords() : getWorks();
        const item = items.find(i => i.id === itemId);
        if (item) {
            document.getElementById('item-title').value = item.title;
            document.getElementById('item-content').value = item.content;
            document.getElementById('item-date').value = item.date;
            document.getElementById('item-tags').value = item.tags ? item.tags.join(', ') : '';
            if (item.image) {
                tempImageData = item.image;
                document.getElementById('image-preview').innerHTML = `<img src="${item.image}" alt="预览">`;
            }
        }
    }
    
    modal.classList.add('show');
}

function closeModal(e) {
    if (e && e.target !== document.getElementById('modal')) return;
    document.getElementById('modal').classList.remove('show');
}

// 保存数据
function saveItem(e) {
    e.preventDefault();
    
    const type = document.getElementById('item-type').value;
    const itemId = document.getElementById('item-id').value;
    const title = document.getElementById('item-title').value.trim();
    const content = document.getElementById('item-content').value.trim();
    const date = document.getElementById('item-date').value;
    const tagsInput = document.getElementById('item-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const item = {
        id: itemId || generateId(),
        title, content, date, tags,
        image: tempImageData,
        updatedAt: new Date().toISOString()
    };
    
    if (type === 'life') {
        const records = getLifeRecords();
        if (itemId) {
            const index = records.findIndex(r => r.id === itemId);
            if (index > -1) records[index] = item;
        } else {
            records.unshift(item);
        }
        localStorage.setItem(StorageKeys.LIFE, JSON.stringify(records));
    } else {
        const works = getWorks();
        if (itemId) {
            const index = works.findIndex(w => w.id === itemId);
            if (index > -1) works[index] = item;
        } else {
            works.unshift(item);
        }
        localStorage.setItem(StorageKeys.WORKS, JSON.stringify(works));
    }
    
    closeModal();
    loadData();
}

// 编辑项目
function editItem(type, itemId) {
    openModal(type, itemId);
}

// 查看项目
function viewItem(type, itemId) {
    const items = type === 'life' ? getLifeRecords() : getWorks();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const typeName = type === 'life' ? '生活记录' : '作品';
    let text = `${typeName}\n\n标题：${item.title}\n日期：${new Date(item.date).toLocaleDateString('zh-CN')}\n\n${item.content}`;
    if (item.tags && item.tags.length) text += `\n标签：${item.tags.join(', ')}`;
    alert(text);
}

// 删除项目
function deleteItem(type, itemId) {
    if (!confirm('确定要删除吗？')) return;
    
    if (type === 'life') {
        const records = getLifeRecords().filter(r => r.id !== itemId);
        localStorage.setItem(StorageKeys.LIFE, JSON.stringify(records));
    } else {
        const works = getWorks().filter(w => w.id !== itemId);
        localStorage.setItem(StorageKeys.WORKS, JSON.stringify(works));
    }
    loadData();
}

// 分享到微信
function shareToWeChat(itemId, type) {
    const modal = document.getElementById('share-modal');
    const url = window.location.href + '#' + type + '-' + itemId;
    
    document.getElementById('share-url').textContent = url;
    modal.classList.add('show');
}

function closeShareModal(e) {
    if (e && e.target !== document.getElementById('share-modal')) return;
    document.getElementById('share-modal').classList.remove('show');
}

function copyShareLink() {
    const url = document.getElementById('share-url').textContent;
    navigator.clipboard.writeText(url).then(() => {
        alert('链接已复制，可以粘贴到微信了');
    }).catch(() => {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        alert('链接已复制');
    });
}

// 工具函数
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ESC键关闭弹窗
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeThemeModal();
        closeShareModal();
    }
});
