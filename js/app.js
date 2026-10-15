// 数据管理
const StorageKeys = {
    CURRENT_USER: 'site_current_user',
    USERS: 'site_users',
    USER_COUNT: 'site_user_count',
    LIFE: 'site_life',
    WORKS: 'site_works',
    THEME: 'site_theme',
    DARK_MODE: 'site_dark_mode',
    FRIENDS: 'site_friends',
    FRIEND_REQUESTS: 'site_friend_requests',
    AVATARS: 'site_avatars'
};

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

const MAX_USERNAME_LENGTH = 12;
const ADMIN_CODE = 'wknwknwkn';
const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB 限制

let currentUser = null;
let isLoginMode = false;
let currentTheme = 'default';
let tempImageData = null;
let tempFileName = null;
let tempFileType = null;
let tempFileSize = null;
let isDarkMode = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
    loadTheme();
    loadDarkMode();
    initEmojiPicker();
});

// ==================== 工具函数 ====================

function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'h' + Math.abs(hash).toString(36);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ==================== 用户管理 ====================

function getAllUsers() {
    try {
        const data = localStorage.getItem(StorageKeys.USERS);
        return data ? JSON.parse(data) : {};
    } catch(e) {
        return {};
    }
}

function saveUser(userId, userData) {
    const users = getAllUsers();
    users[userId] = userData;
    localStorage.setItem(StorageKeys.USERS, JSON.stringify(users));
}

function getUser(userId) {
    const users = getAllUsers();
    return users[userId];
}

function generateUserId() {
    let count = parseInt(localStorage.getItem(StorageKeys.USER_COUNT) || '0');
    count++;
    localStorage.setItem(StorageKeys.USER_COUNT, count.toString());
    return 'NYS-Kn' + count.toString().padStart(3, '0');
}

function getCurrentUser() {
    const userId = localStorage.getItem(StorageKeys.CURRENT_USER);
    if (userId) {
        return getUser(userId);
    }
    return null;
}

function setCurrentUser(userId) {
    if (userId) {
        localStorage.setItem(StorageKeys.CURRENT_USER, userId);
    } else {
        localStorage.removeItem(StorageKeys.CURRENT_USER);
    }
}

// ==================== 头像管理 ====================

function getAvatar(userId) {
    try {
        const avatars = JSON.parse(localStorage.getItem(StorageKeys.AVATARS) || '{}');
        return avatars[userId] || '';
    } catch(e) {
        return '';
    }
}

function saveAvatar(userId, avatarData) {
    const avatars = JSON.parse(localStorage.getItem(StorageKeys.AVATARS) || '{}');
    avatars[userId] = avatarData;
    localStorage.setItem(StorageKeys.AVATARS, JSON.stringify(avatars));
}

function removeAvatar(userId) {
    const avatars = JSON.parse(localStorage.getItem(StorageKeys.AVATARS) || '{}');
    delete avatars[userId];
    localStorage.setItem(StorageKeys.AVATARS, JSON.stringify(avatars));
}

// ==================== 界面切换 ====================

function checkAuth() {
    currentUser = getCurrentUser();
    if (currentUser) {
        showMainScreen();
    } else {
        showAuthScreen();
        loadAccountList();
    }
}

function showMainScreen() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';

    document.getElementById('nav-username').textContent = currentUser.username;
    document.getElementById('nav-userid').textContent = currentUser.userId;
    document.getElementById('settings-userid').textContent = currentUser.userId;
    document.getElementById('settings-username').textContent = currentUser.username;
    document.getElementById('settings-created').textContent =
        new Date(currentUser.createdAt).toLocaleDateString('zh-CN');

    updateAvatarDisplay();
    loadFeed();
    loadFriends();
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').style.display = 'none';
}

function loadAccountList() {
    const users = getAllUsers();
    const userIds = Object.keys(users);
    const accountList = document.getElementById('account-list');
    const accountsDiv = document.getElementById('accounts');
    
    if (userIds.length > 0 && accountList && accountsDiv) {
        accountList.style.display = 'block';
        let html = '';
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            const user = users[userId];
            const avatar = getAvatar(userId);
            const avatarHtml = avatar 
                ? '<img src="' + avatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
                : user.username.charAt(0).toUpperCase();
            html += '<div class="account-item" onclick="loginWithAccount(\'' + userId + '\')">' +
                '<div class="account-avatar">' + avatarHtml + '</div>' +
                '<div class="account-info">' +
                    '<div class="account-name">' + escapeHtml(user.username) + '</div>' +
                    '<div class="account-id">' + userId + '</div>' +
                '</div>' +
            '</div>';
        }
        accountsDiv.innerHTML = html;
    } else if (accountList) {
        accountList.style.display = 'none';
    }
}

function loginWithAccount(userId) {
    const user = getUser(userId);
    if (!user) return;
    
    document.getElementById('username').value = userId;
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
    
    if (!isLoginMode) {
        toggleAuthMode();
    }
}

// ==================== 事件绑定 ====================

function setupEventListeners() {
    const authForm = document.getElementById('auth-form');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }
    
    const switchBtn = document.getElementById('auth-switch-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleAuthMode();
        });
    }
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', openThemeModal);
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].addEventListener('click', function(e) {
            e.preventDefault();
            switchPage(this.dataset.page);
        });
    }
}

// ==================== 主题 ====================

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
    if (!container) return;
    let html = '';
    for (let i = 0; i < themeKeys.length; i++) {
        const key = themeKeys[i];
        const theme = Themes[key];
        const selected = key === currentTheme ? 'selected' : '';
        html += '<div class="theme-item ' + selected + '" style="background:' + theme.color + '" onclick="selectTheme(\'' + key + '\')" title="' + theme.name + '"></div>';
    }
    container.innerHTML = html;
}

function selectTheme(key) {
    applyTheme(key);
    openThemeModal();
}

function closeThemeModal(e) {
    if (e && e.target !== document.getElementById('theme-modal')) return;
    document.getElementById('theme-modal').classList.remove('show');
}

// ==================== 深色模式 ====================

function loadDarkMode() {
    const saved = localStorage.getItem(StorageKeys.DARK_MODE) === 'true';
    isDarkMode = saved;
    applyDarkMode(saved);
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem(StorageKeys.DARK_MODE, isDarkMode.toString());
    applyDarkMode(isDarkMode);
}

function applyDarkMode(enabled) {
    document.body.classList.toggle('dark-mode', enabled);
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) toggle.checked = enabled;
}

// ==================== 表情 ====================

function initEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    if (!picker) return;
    let html = '';
    for (let i = 0; i < Emojis.length; i++) {
        html += '<span class="emoji-item" onclick="insertEmoji(\'' + Emojis[i] + '\')">' + Emojis[i] + '</span>';
    }
    picker.innerHTML = html;
}

function insertEmoji(emoji) {
    const textarea = document.getElementById('item-content');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    textarea.value = text.substring(0, start) + emoji + text.substring(end);
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
}

// ==================== 头像显示 ====================

function updateAvatarDisplay() {
    if (!currentUser) return;
    
    const avatar = getAvatar(currentUser.userId);
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
        if (avatar) {
            navAvatar.innerHTML = '<img src="' + avatar + '" alt="avatar">';
        } else {
            navAvatar.innerHTML = '<div class="nav-avatar-text">' + currentUser.username.charAt(0).toUpperCase() + '</div>';
        }
    }
    
    const settingsAvatar = document.getElementById('current-avatar');
    if (settingsAvatar) {
        if (avatar) {
            settingsAvatar.src = avatar;
            settingsAvatar.style.display = 'block';
        } else {
            settingsAvatar.style.display = 'none';
        }
    }
}

function changeAvatar(e) {
    const file = e.target.files[0];
    if (!file || !currentUser) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        saveAvatar(currentUser.userId, event.target.result);
        updateAvatarDisplay();
        loadFeed();
        alert('头像已更新');
    };
    reader.readAsDataURL(file);
}

function resetAvatar() {
    if (!currentUser) return;
    removeAvatar(currentUser.userId);
    updateAvatarDisplay();
    loadFeed();
    alert('已恢复默认头像');
}

// ==================== 修改用户名/密码 ====================

function changeUsername(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    const newUsername = document.getElementById('new-username').value.trim();
    const errorEl = document.getElementById('username-error');
    const successEl = document.getElementById('username-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (newUsername.length < 2) {
        errorEl.textContent = '用户名至少2个字符';
        return;
    }
    
    if (newUsername.length > MAX_USERNAME_LENGTH) {
        errorEl.textContent = '用户名最多' + MAX_USERNAME_LENGTH + '个字符';
        return;
    }
    
    currentUser.username = newUsername;
    saveUser(currentUser.userId, currentUser);
    
    document.getElementById('nav-username').textContent = newUsername;
    document.getElementById('settings-username').textContent = newUsername;
    updateAvatarDisplay();
    loadFeed();
    
    successEl.textContent = '用户名修改成功';
    document.getElementById('username-form').reset();
    
    setTimeout(function() {
        successEl.textContent = '';
    }, 3000);
}

function changePassword(e) {
    e.preventDefault();
    if (!currentUser) return;
    
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
    saveUser(currentUser.userId, currentUser);
    
    successEl.textContent = '密码修改成功';
    document.getElementById('password-form').reset();
    
    setTimeout(function() {
        successEl.textContent = '';
    }, 3000);
}

// ==================== 重置密码 ====================

function openResetModal() {
    document.getElementById('reset-modal').classList.add('show');
    document.getElementById('reset-error').textContent = '';
    document.getElementById('reset-success').textContent = '';
    document.getElementById('reset-form').reset();
    
    const users = getAllUsers();
    const userIds = Object.keys(users).sort();
    const select = document.getElementById('reset-account');
    select.innerHTML = '<option value="">请选择账号（共 ' + userIds.length + ' 个）</option>';
    for (let i = 0; i < userIds.length; i++) {
        const userId = userIds[i];
        const user = users[userId];
        select.innerHTML += '<option value="' + userId + '">' + (i+1) + '. ' + escapeHtml(user.username) + ' (' + userId + ')</option>';
    }
}

function closeResetModal(e) {
    if (e && e.target !== document.getElementById('reset-modal')) return;
    document.getElementById('reset-modal').classList.remove('show');
}

function resetAllData() {
    const adminCode = document.getElementById('admin-code').value;
    const errorEl = document.getElementById('reset-error');
    const successEl = document.getElementById('reset-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (adminCode !== ADMIN_CODE) {
        errorEl.textContent = '管理员口令不正确';
        return;
    }
    
    if (!confirm('确定要重置所有用户数据吗？这将删除所有账号、记录和设置！')) {
        return;
    }
    
    localStorage.removeItem(StorageKeys.USERS);
    localStorage.removeItem(StorageKeys.USER_COUNT);
    localStorage.removeItem(StorageKeys.CURRENT_USER);
    localStorage.removeItem(StorageKeys.LIFE);
    localStorage.removeItem(StorageKeys.WORKS);
    localStorage.removeItem(StorageKeys.FRIENDS);
    localStorage.removeItem(StorageKeys.FRIEND_REQUESTS);
    localStorage.removeItem(StorageKeys.AVATARS);
    
    successEl.textContent = '所有数据已重置！';
    
    setTimeout(function() {
        closeResetModal();
        location.reload();
    }, 1500);
}

function resetPassword(e) {
    e.preventDefault();
    const selectedUserId = document.getElementById('reset-account').value;
    const adminCode = document.getElementById('admin-code').value;
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const errorEl = document.getElementById('reset-error');
    const successEl = document.getElementById('reset-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (!selectedUserId) {
        errorEl.textContent = '请选择要重置的账号';
        return;
    }
    
    if (adminCode !== ADMIN_CODE) {
        errorEl.textContent = '管理员口令不正确';
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
    
    const users = getAllUsers();
    if (!users[selectedUserId]) {
        errorEl.textContent = '账号不存在';
        return;
    }
    
    users[selectedUserId].password = hashPassword(newPassword);
    localStorage.setItem(StorageKeys.USERS, JSON.stringify(users));
    
    successEl.textContent = '密码重置成功，请使用新密码登录';
    
    setTimeout(function() {
        closeResetModal();
        if (!isLoginMode) {
            toggleAuthMode();
        }
    }, 2000);
}

// ==================== 登录/注册 ====================

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const confirmGroup = document.getElementById('confirm-group');
    const authBtn = document.querySelector('.auth-btn');
    const switchText = document.getElementById('auth-switch-text');
    const switchBtn = document.getElementById('auth-switch-btn');
    const title = document.querySelector('.auth-title');
    const usernameLabel = document.getElementById('username-label');
    const usernameInput = document.getElementById('username');
    
    if (isLoginMode) {
        confirmGroup.style.display = 'none';
        authBtn.textContent = '登录';
        switchText.textContent = '还没有账号？';
        switchBtn.textContent = '立即注册';
        title.textContent = '欢迎回来';
        usernameLabel.textContent = '用户ID（如：NYS-Kn001）';
        usernameInput.removeAttribute('maxlength');
    } else {
        confirmGroup.style.display = 'block';
        authBtn.textContent = '创建账号';
        switchText.textContent = '已有账号？';
        switchBtn.textContent = '直接登录';
        title.textContent = '欢迎来到我的空间';
        usernameLabel.textContent = '你的名称（最多12字）';
        usernameInput.setAttribute('maxlength', '12');
    }
    document.getElementById('auth-error').textContent = '';
}

function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!username) { 
        errorEl.textContent = isLoginMode ? '请输入用户ID' : '请输入名称'; 
        return; 
    }
    if (!password) { errorEl.textContent = '请输入密码'; return; }
    
    if (!isLoginMode) {
        if (username.length > MAX_USERNAME_LENGTH) { 
            errorEl.textContent = '用户名最多' + MAX_USERNAME_LENGTH + '个字符'; 
            return; 
        }
        if (password.length < 4) { errorEl.textContent = '密码至少4位'; return; }
        if (password !== confirmPassword) { errorEl.textContent = '两次密码不一致'; return; }
        
        const userId = generateUserId();
        const user = { 
            username: username, 
            userId: userId,
            password: hashPassword(password), 
            createdAt: new Date().toISOString() 
        };
        
        saveUser(userId, user);
        setCurrentUser(userId);
        currentUser = user;
        
        showMainScreen();
    } else {
        const users = getAllUsers();
        const user = users[username];
        
        if (!user) {
            errorEl.textContent = '用户不存在，请检查ID是否正确';
            return;
        }

        if (user.password !== hashPassword(password)) {
            errorEl.textContent = '密码不正确';
            return;
        }

        setCurrentUser(username);
        currentUser = user;
        showMainScreen();
    }
}

function logout() {
    if (!confirm('确定要退出登录吗？')) return;
    setCurrentUser(null);
    currentUser = null;
    showAuthScreen();
    loadAccountList();
}

function switchAccount() {
    setCurrentUser(null);
    currentUser = null;
    showAuthScreen();
    loadAccountList();
}
// ==================== 页面切换 ====================

function switchPage(pageName) {
    const navLinks = document.querySelectorAll('.nav-link');
    for (let i = 0; i < navLinks.length; i++) {
        navLinks[i].classList.toggle('active', navLinks[i].dataset.page === pageName);
    }
    const pages = document.querySelectorAll('.page');
    for (let i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
    }
    const target = document.getElementById('page-' + pageName);
    if (target) target.classList.add('active');

    if (pageName === 'home') loadFeed();
    if (pageName === 'life') loadLife();
    if (pageName === 'works') loadWorks();
    if (pageName === 'friends') loadFriends();
}

// ==================== 数据管理 ====================

function getLife() {
    try {
        const data = localStorage.getItem(StorageKeys.LIFE);
        return data ? JSON.parse(data) : {};
    } catch(e) { return {}; }
}

function saveLife(life) {
    localStorage.setItem(StorageKeys.LIFE, JSON.stringify(life));
}

function getWorks() {
    try {
        const data = localStorage.getItem(StorageKeys.WORKS);
        return data ? JSON.parse(data) : {};
    } catch(e) { return {}; }
}

function saveWorks(works) {
    localStorage.setItem(StorageKeys.WORKS, JSON.stringify(works));
}

// ==================== 文件预览（支持 PDF） ====================

function previewFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小
    if (file.size > MAX_FILE_SIZE) {
        alert('文件太大，最大支持 ' + formatFileSize(MAX_FILE_SIZE));
        e.target.value = '';
        return;
    }
    
    const preview = document.getElementById('image-preview');
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            preview.innerHTML = '<img src="' + ev.target.result + '" style="max-width:100%;border-radius:8px;">';
            tempImageData = ev.target.result;
            tempFileName = file.name;
            tempFileType = file.type;
            tempFileSize = file.size;
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
        // PDF 用 Object URL 即时预览
        const fileURL = URL.createObjectURL(file);
        preview.innerHTML = 
            '<embed src="' + fileURL + '" type="application/pdf" width="100%" height="400px" style="border-radius:8px;">' +
            '<p style="margin-top:8px;color:#666;font-size:13px;">📄 ' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</p>';
        
        // 同时读取为 base64 保存
        const reader = new FileReader();
        reader.onload = function(ev) {
            tempImageData = ev.target.result;
            tempFileName = file.name;
            tempFileType = file.type;
            tempFileSize = file.size;
        };
        reader.readAsDataURL(file);
    } else {
        preview.innerHTML = '<p>📎 已选择文件：' + escapeHtml(file.name) + ' (' + formatFileSize(file.size) + ')</p>';
        tempImageData = null;
        tempFileName = file.name;
        tempFileType = file.type;
        tempFileSize = file.size;
    }
}

// ==================== 内容加载（带文件显示） ====================

function getFileHtml(item) {
    if (!item.fileData) return '';
    
    if (item.fileType === 'application/pdf') {
        return '<div class="card-file" style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.05);border-radius:8px;">' +
            '<a href="' + item.fileData + '" target="_blank" download="' + escapeHtml(item.fileName || 'document.pdf') + '" ' +
            'style="color:var(--accent);text-decoration:none;display:flex;align-items:center;gap:8px;">' +
            '<span style="font-size:20px;">📄</span>' +
            '<span>' + escapeHtml(item.fileName || 'PDF 文件') + '</span>' +
            '<span style="color:#999;font-size:12px;">点击下载/预览</span>' +
            '</a>' +
        '</div>';
    } else if (item.fileType && item.fileType.startsWith('image/')) {
        return '<div class="card-image" style="margin-top:10px;">' +
            '<img src="' + item.fileData + '" style="max-width:100%;border-radius:8px;cursor:pointer;" ' +
            'onclick="window.open(\'' + item.fileData + '\')" alt="' + escapeHtml(item.fileName || '图片') + '">' +
        '</div>';
    } else if (item.fileName) {
        return '<div class="card-file" style="margin-top:10px;padding:10px;background:rgba(0,0,0,0.05);border-radius:8px;">' +
            '<span>📎 ' + escapeHtml(item.fileName) + '</span>' +
        '</div>';
    }
    return '';
}

function loadFeed() {
    const life = getLife();
    const works = getWorks();
    const myLife = life[currentUser.userId] || [];
    const myWorks = works[currentUser.userId] || [];

    const all = [];
    for (let i = 0; i < myLife.length; i++) {
        all.push({ type: 'life', data: myLife[i] });
    }
    for (let i = 0; i < myWorks.length; i++) {
        all.push({ type: 'work', data: myWorks[i] });
    }
    all.sort(function(a, b) {
        return new Date(b.data.date) - new Date(a.data.date);
    });

    const feedList = document.getElementById('feed-list');
    const feedEmpty = document.getElementById('feed-empty');

    if (all.length === 0) {
        feedList.innerHTML = '';
        feedEmpty.style.display = 'block';
        return;
    }
    feedEmpty.style.display = 'none';

    let html = '';
    for (let i = 0; i < all.length; i++) {
        const item = all[i];
        const typeLabel = item.type === 'life' ? '生活记录' : '作品';
        html += '<div class="feed-item">' +
            '<div class="feed-type">' + typeLabel + '</div>' +
            '<div class="feed-title">' + escapeHtml(item.data.title) + '</div>' +
            '<div class="feed-content">' + escapeHtml(item.data.content) + '</div>' +
            getFileHtml(item.data) +
            '<div class="feed-date">' + item.data.date + '</div>' +
        '</div>';
    }
    feedList.innerHTML = html;
}

function loadLife() {
    const life = getLife();
    const myLife = life[currentUser.userId] || [];
    const list = document.getElementById('life-list');
    const empty = document.getElementById('life-empty');

    if (myLife.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    let html = '';
    for (let i = 0; i < myLife.length; i++) {
        const item = myLife[i];
        html += '<div class="card">' +
            '<div class="card-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="card-content">' + escapeHtml(item.content) + '</div>' +
            getFileHtml(item) +
            '<div class="card-date">' + item.date + '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-small" onclick="editItem(\'life\',\'' + item.id + '\')">编辑</button>' +
                '<button class="btn-small btn-danger" onclick="deleteItem(\'life\',\'' + item.id + '\')">删除</button>' +
            '</div>' +
        '</div>';
    }
    list.innerHTML = html;
}

function loadWorks() {
    const works = getWorks();
    const myWorks = works[currentUser.userId] || [];
    const list = document.getElementById('works-list');
    const empty = document.getElementById('works-empty');

    if (myWorks.length === 0) {
        list.innerHTML = '';
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';
    let html = '';
    for (let i = 0; i < myWorks.length; i++) {
        const item = myWorks[i];
        html += '<div class="card">' +
            '<div class="card-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="card-content">' + escapeHtml(item.content) + '</div>' +
            getFileHtml(item) +
            '<div class="card-date">' + item.date + '</div>' +
            '<div class="card-actions">' +
                '<button class="btn-small" onclick="editItem(\'work\',\'' + item.id + '\')">编辑</button>' +
                '<button class="btn-small btn-danger" onclick="deleteItem(\'work\',\'' + item.id + '\')">删除</button>' +
            '</div>' +
        '</div>';
    }
    list.innerHTML = html;
}

// ==================== 弹窗操作 ====================

function openModal(type, itemId) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const typeInput = document.getElementById('item-type');
    const idInput = document.getElementById('item-id');

    typeInput.value = type;
    idInput.value = itemId || '';

    if (type === 'life') {
        title.textContent = itemId ? '编辑生活记录' : '新建生活记录';
    } else {
        title.textContent = itemId ? '编辑作品' : '添加作品';
    }

    // 清空临时文件数据
    tempImageData = null;
    tempFileName = null;
    tempFileType = null;
    tempFileSize = null;
    document.getElementById('image-preview').innerHTML = '';

    if (itemId) {
        const data = type === 'life' ? getLife() : getWorks();
        const items = data[currentUser.userId] || [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].id === itemId) {
                document.getElementById('item-title').value = items[i].title;
                document.getElementById('item-content').value = items[i].content;
                document.getElementById('item-date').value = items[i].date;
                document.getElementById('item-tags').value = items[i].tags || '';
                
                // 恢复文件显示
                if (items[i].fileData) {
                    tempImageData = items[i].fileData;
                    tempFileName = items[i].fileName;
                    tempFileType = items[i].fileType;
                    tempFileSize = items[i].fileSize;
                    
                    const preview = document.getElementById('image-preview');
                    if (items[i].fileType === 'application/pdf') {
                        preview.innerHTML = '<p style="padding:10px;background:rgba(0,0,0,0.05);border-radius:8px;">📄 已上传：' + 
                            escapeHtml(items[i].fileName) + ' (' + formatFileSize(items[i].fileSize || 0) + ')</p>';
                    } else if (items[i].fileType && items[i].fileType.startsWith('image/')) {
                        preview.innerHTML = '<img src="' + items[i].fileData + '" style="max-width:100%;border-radius:8px;">';
                    }
                }
                break;
            }
        }
    } else {
        document.getElementById('modal-form').reset();
        document.getElementById('item-date').value = new Date().toISOString().split('T')[0];
    }

    modal.classList.add('show');
}

function closeModal(e) {
    if (e && e.target !== document.getElementById('modal')) return;
    document.getElementById('modal').classList.remove('show');
    // 清空临时数据
    tempImageData = null;
    tempFileName = null;
    tempFileType = null;
    tempFileSize = null;
}

function saveItem(e) {
    e.preventDefault();
    const type = document.getElementById('item-type').value;
    const itemId = document.getElementById('item-id').value;
    const title = document.getElementById('item-title').value.trim();
    const content = document.getElementById('item-content').value.trim();
    const date = document.getElementById('item-date').value;
    const tags = document.getElementById('item-tags').value.trim();

    if (!title || !content || !date) {
        alert('请填写完整信息');
        return;
    }

    const item = {
        id: itemId || generateId(),
        title: title,
        content: content,
        date: date,
        tags: tags,
        createdAt: new Date().toISOString()
    };
    
    // 保存文件数据（如果有）
    if (tempImageData) {
        item.fileData = tempImageData;
        item.fileName = tempFileName;
        item.fileType = tempFileType;
        item.fileSize = tempFileSize;
    }

    if (type === 'life') {
        const life = getLife();
        if (!life[currentUser.userId]) life[currentUser.userId] = [];
        if (itemId) {
            for (let i = 0; i < life[currentUser.userId].length; i++) {
                if (life[currentUser.userId][i].id === itemId) {
                    // 保留原有文件数据（如果没有新上传）
                    if (!tempImageData && life[currentUser.userId][i].fileData) {
                        item.fileData = life[currentUser.userId][i].fileData;
                        item.fileName = life[currentUser.userId][i].fileName;
                        item.fileType = life[currentUser.userId][i].fileType;
                        item.fileSize = life[currentUser.userId][i].fileSize;
                    }
                    life[currentUser.userId][i] = item;
                    break;
                }
            }
        } else {
            life[currentUser.userId].push(item);
        }
        saveLife(life);
        loadLife();
    } else {
        const works = getWorks();
        if (!works[currentUser.userId]) works[currentUser.userId] = [];
        if (itemId) {
            for (let i = 0; i < works[currentUser.userId].length; i++) {
                if (works[currentUser.userId][i].id === itemId) {
                    // 保留原有文件数据（如果没有新上传）
                    if (!tempImageData && works[currentUser.userId][i].fileData) {
                        item.fileData = works[currentUser.userId][i].fileData;
                        item.fileName = works[currentUser.userId][i].fileName;
                        item.fileType = works[currentUser.userId][i].fileType;
                        item.fileSize = works[currentUser.userId][i].fileSize;
                    }
                    works[currentUser.userId][i] = item;
                    break;
                }
            }
        } else {
            works[currentUser.userId].push(item);
        }
        saveWorks(works);
        loadWorks();
    }

    closeModal();
        closeModal();
    // 强制刷新所有列表
    setTimeout(function() {
        loadFeed();
        loadLife();
        loadWorks();
    }, 100);
}

}

function editItem(type, itemId) {
    openModal(type, itemId);
}

function deleteItem(type, itemId) {
    if (!confirm('确定要删除吗？')) return;

    if (type === 'life') {
        const life = getLife();
        if (life[currentUser.userId]) {
            life[currentUser.userId] = life[currentUser.userId].filter(function(item) {
                return item.id !== itemId;
            });
            saveLife(life);
            loadLife();
        }
    } else {
        const works = getWorks();
        if (works[currentUser.userId]) {
            works[currentUser.userId] = works[currentUser.userId].filter(function(item) {
                return item.id !== itemId;
            });
            saveWorks(works);
            loadWorks();
        }
    }
    loadFeed();
}

// ==================== 好友系统 ====================

function getFriends() {
    try {
        const data = localStorage.getItem(StorageKeys.FRIENDS);
        return data ? JSON.parse(data) : {};
    } catch(e) {
        return {};
    }
}

function saveFriends(friends) {
    localStorage.setItem(StorageKeys.FRIENDS, JSON.stringify(friends));
}

function getFriendRequests() {
    try {
        const data = localStorage.getItem(StorageKeys.FRIEND_REQUESTS);
        return data ? JSON.parse(data) : [];
    } catch(e) {
        return [];
    }
}

function saveFriendRequests(requests) {
    localStorage.setItem(StorageKeys.FRIEND_REQUESTS, JSON.stringify(requests));
}

function openAddFriendModal() {
    document.getElementById('friend-modal').classList.add('show');
    document.getElementById('friend-error').textContent = '';
    document.getElementById('friend-success').textContent = '';
}

function closeFriendModal(e) {
    if (e && e.target !== document.getElementById('friend-modal')) return;
    document.getElementById('friend-modal').classList.remove('show');
}

function sendFriendRequest(e) {
    e.preventDefault();
    if (!currentUser) return;
    
    const friendId = document.getElementById('friend-id').value.trim();
    const message = document.getElementById('friend-message').value.trim();
    const errorEl = document.getElementById('friend-error');
    const successEl = document.getElementById('friend-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
    if (friendId === currentUser.userId) {
        errorEl.textContent = '不能添加自己为好友';
        return;
    }
    
    const users = getAllUsers();
    if (!users[friendId]) {
        errorEl.textContent = '用户不存在，请检查ID是否正确';
        return;
    }
    
    const friends = getFriends();
    const myFriends = friends[currentUser.userId] || [];
    if (myFriends.indexOf(friendId) > -1) {
        errorEl.textContent = '已经是好友了';
        return;
    }
    
    const requests = getFriendRequests();
    for (let i = 0; i < requests.length; i++) {
        if (requests[i].from === currentUser.userId && requests[i].to === friendId) {
            errorEl.textContent = '已经发送过好友请求了';
            return;
        }
    }
    
    const request = {
        id: generateId(),
        from: currentUser.userId,
        fromUsername: currentUser.username,
        to: friendId,
        message: message || '请求添加你为好友',
        timestamp: new Date().toISOString()
    };
    
    requests.push(request);
    saveFriendRequests(requests);
    
    successEl.textContent = '好友请求已发送';
    document.getElementById('friend-form').reset();
    
    setTimeout(function() {
        closeFriendModal();
    }, 1500);
}

function acceptFriendRequest(requestId) {
    if (!currentUser) return;
    
    const requests = getFriendRequests();
    let request = null;
    for (let i = 0; i < requests.length; i++) {
        if (requests[i].id === requestId) {
            request = requests[i];
            break;
        }
    }
    if (!request) return;
    
    const friends = getFriends();
    
    if (!friends[currentUser.userId]) {
        friends[currentUser.userId] = [];
    }
    if (friends[currentUser.userId].indexOf(request.from) === -1) {
        friends[currentUser.userId].push(request.from);
    }
    
    if (!friends[request.from]) {
        friends[request.from] = [];
    }
    if (friends[request.from].indexOf(currentUser.userId) === -1) {
        friends[request.from].push(currentUser.userId);
    }
    
    saveFriends(friends);
    
    const newRequests = requests.filter(function(r) {
        return r.id !== requestId;
    });
    saveFriendRequests(newRequests);
    
    loadFriends();
    alert('已添加好友');
}

function rejectFriendRequest(requestId) {
    const requests = getFriendRequests();
    const newRequests = requests.filter(function(r) {
        return r.id !== requestId;
    });
    saveFriendRequests(newRequests);
    loadFriends();
}

function removeFriend(friendId) {
    if (!currentUser) return;
    if (!confirm('确定要删除这个好友吗？')) return;
    
    const friends = getFriends();
    
    if (friends[currentUser.userId]) {
        friends[currentUser.userId] = friends[currentUser.userId].filter(function(id) {
            return id !== friendId;
        });
    }
    
    if (friends[friendId]) {
        friends[friendId] = friends[friendId].filter(function(id) {
            return id !== currentUser.userId;
        });
    }
    
    saveFriends(friends);
    loadFriends();
}

function loadFriends() {
    if (!currentUser) return;
    
    const friends = getFriends();
    const requests = getFriendRequests();
    const users = getAllUsers();
    
    const requestsSection = document.getElementById('friend-requests-section');
    const requestsList = document.getElementById('friend-requests-list');
    const myRequests = requests.filter(function(r) {
        return r.to === currentUser.userId;
    });
    
    if (myRequests.length > 0) {
        requestsSection.style.display = 'block';
        let html = '';
        for (let i = 0; i < myRequests.length; i++) {
            const r = myRequests[i];
            const avatar = getAvatar(r.from);
            const avatarHtml = avatar 
                ? '<img src="' + avatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
                : r.fromUsername.charAt(0).toUpperCase();
            html += '<div class="friend-request-item">' +
                '<div class="friend-avatar">' + avatarHtml + '</div>' +
                '<div class="friend-info">' +
                    '<div class="friend-name">' + escapeHtml(r.fromUsername) + '</div>' +
                    '<div class="friend-id">' + r.from + '</div>' +
                    '<div class="friend-request-message">' + escapeHtml(r.message) + '</div>' +
                '</div>' +
                '<div class="friend-actions">' +
                    '<button class="friend-btn accept" onclick="acceptFriendRequest(\'' + r.id + '\')">接受</button>' +
                    '<button class="friend-btn reject" onclick="rejectFriendRequest(\'' + r.id + '\')">拒绝</button>' +
                '</div>' +
            '</div>';
        }
        requestsList.innerHTML = html;
    } else {
        requestsSection.style.display = 'none';
    }
    
    const friendsList = document.getElementById('friends-list');
    const friendsEmpty = document.getElementById('friends-empty');
    const myFriends = friends[currentUser.userId] || [];
    
    if (myFriends.length === 0) {
        friendsList.innerHTML = '';
        friendsEmpty.style.display = 'block';
        return;
    }
    
    friendsEmpty.style.display = 'none';
    let html = '';
    for (let i = 0; i < myFriends.length; i++) {
        const friendId = myFriends[i];
        const user = users[friendId] || { username: '未知用户' };
        const avatar = getAvatar(friendId);
        const avatarHtml = avatar 
            ? '<img src="' + avatar + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">'
            : user.username.charAt(0).toUpperCase();
        html += '<div class="friend-item">' +
            '<div class="friend-avatar">' + avatarHtml + '</div>' +
            '<div class="friend-info">' +
                '<div class="friend-name">' + escapeHtml(user.username) + '</div>' +
                '<div class="friend-id">' + friendId + '</div>' +
            '</div>' +
            '<div class="friend-actions">' +
                '<button class="friend-btn remove" onclick="removeFriend(\'' + friendId + '\')">删除</button>' +
            '</div>' +
        '</div>';
    }
    friendsList.innerHTML = html;
}

// ==================== 分享 ====================

function copyShareLink() {
    const url = document.getElementById('share-url').textContent;
    navigator.clipboard.writeText(url).then(function() {
        alert('链接已复制');
    });
}

function closeShareModal(e) {
    if (e && e.target !== document.getElementById('share-modal')) return;
    document.getElementById('share-modal').classList.remove('show');
}
