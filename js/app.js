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

let currentUser = null;
let isLoginMode = false;
let currentTheme = 'default';
let tempImageData = null;
let tempFileName = null;
let tempFileType = null;
let tempFileSize = null;
let isDarkMode = false;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    loadTheme();
    loadDarkMode();
    initEmojiPicker();
});

// 用户管理
function getAllUsers() {
    const data = localStorage.getItem(StorageKeys.USERS);
    return data ? JSON.parse(data) : {};
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

// 头像管理
function getAvatar(userId) {
    const avatars = JSON.parse(localStorage.getItem(StorageKeys.AVATARS) || '{}');
    return avatars[userId] || '';
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

function checkAuth() {
    currentUser = getCurrentUser();
    if (currentUser) {
        showMainScreen();
    } else {
        showAuthScreen();
        loadAccountList();
    }
}

function loadAccountList() {
    const users = getAllUsers();
    const userIds = Object.keys(users);
    const accountList = document.getElementById('account-list');
    const accountsDiv = document.getElementById('accounts');
    
    if (userIds.length > 0) {
        accountList.style.display = 'block';
        accountsDiv.innerHTML = userIds.map(userId => {
            const user = users[userId];
            const avatar = getAvatar(userId);
            const avatarHtml = avatar 
                ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : user.username.charAt(0).toUpperCase();
            return `
                <div class="account-item" onclick="loginWithAccount('${userId}')">
                    <div class="account-avatar">${avatarHtml}</div>
                    <div class="account-info">
                        <div class="account-name">${escapeHtml(user.username)}</div>
                        <div class="account-id">${userId}</div>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        accountList.style.display = 'none';
    }
}

function loginWithAccount(userId) {
    const user = getUser(userId);
    if (!user) return;
    
    // 显示密码输入
    document.getElementById('username').value = user.username;
    document.getElementById('password').focus();
    
    // 切换到登录模式
    if (!isLoginMode) {
        toggleAuthMode();
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

function updateAvatarDisplay() {
    if (!currentUser) return;
    
    const avatar = getAvatar(currentUser.userId);
    const navAvatar = document.getElementById('nav-avatar');
    if (navAvatar) {
        if (avatar) {
            navAvatar.innerHTML = `<img src="${avatar}" alt="avatar">`;
        } else {
            navAvatar.innerHTML = `<div class="nav-avatar-text">${currentUser.username.charAt(0).toUpperCase()}</div>`;
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
    reader.onload = (event) => {
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
        errorEl.textContent = `用户名最多${MAX_USERNAME_LENGTH}个字符`;
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
    
    setTimeout(() => {
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
    
    setTimeout(() => {
        successEl.textContent = '';
    }, 3000);
}

function openResetModal() {
    document.getElementById('reset-modal').classList.add('show');
    document.getElementById('reset-error').textContent = '';
    document.getElementById('reset-success').textContent = '';
    document.getElementById('reset-form').reset();
}

function closeResetModal(e) {
    if (e && e.target !== document.getElementById('reset-modal')) return;
    document.getElementById('reset-modal').classList.remove('show');
}

function resetPassword(e) {
    e.preventDefault();
    const adminCode = document.getElementById('admin-code').value;
    const newPassword = document.getElementById('reset-new-password').value;
    const confirmPassword = document.getElementById('reset-confirm-password').value;
    const errorEl = document.getElementById('reset-error');
    const successEl = document.getElementById('reset-success');
    
    errorEl.textContent = '';
    successEl.textContent = '';
    
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
    
    // 重置所有账号的密码
    const users = getAllUsers();
    const userIds = Object.keys(users);
    if (userIds.length === 0) {
        errorEl.textContent = '没有可重置的账号';
        return;
    }
    
    // 重置第一个账号（或可以扩展选择特定账号）
    const firstUserId = userIds[0];
    users[firstUserId].password = hashPassword(newPassword);
    localStorage.setItem(StorageKeys.USERS, JSON.stringify(users));
    
    successEl.textContent = '密码重置成功，请使用新密码登录';
    
    setTimeout(() => {
        closeResetModal();
        if (!isLoginMode) {
            toggleAuthMode();
        }
    }, 2000);
}

// 好友系统
function getFriends() {
    const data = localStorage.getItem(StorageKeys.FRIENDS);
    return data ? JSON.parse(data) : {};
}

function saveFriends(friends) {
    localStorage.setItem(StorageKeys.FRIENDS, JSON.stringify(friends));
}

function getFriendRequests() {
    const data = localStorage.getItem(StorageKeys.FRIEND_REQUESTS);
    return data ? JSON.parse(data) : [];
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
    if (myFriends.includes(friendId)) {
        errorEl.textContent = '已经是好友了';
        return;
    }
    
    const requests = getFriendRequests();
    const existingRequest = requests.find(r => r.from === currentUser.userId && r.to === friendId);
    if (existingRequest) {
        errorEl.textContent = '已经发送过好友请求了';
        return;
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
    
    setTimeout(() => {
        closeFriendModal();
    }, 1500);
}

function acceptFriendRequest(requestId) {
    if (!currentUser) return;
    
    const requests = getFriendRequests();
    const request = requests.find(r => r.id === requestId);
    if (!request) return;
    
    // 添加好友关系（双向）
    const friends = getFriends();
    
    // 添加到当前用户的好友列表
    if (!friends[currentUser.userId]) {
        friends[currentUser.userId] = [];
    }
    if (!friends[currentUser.userId].includes(request.from)) {
        friends[currentUser.userId].push(request.from);
    }
    
    // 添加到对方的好友列表
    if (!friends[request.from]) {
        friends[request.from] = [];
    }
    if (!friends[request.from].includes(currentUser.userId)) {
        friends[request.from].push(currentUser.userId);
    }
    
    saveFriends(friends);
    
    // 删除请求
    const newRequests = requests.filter(r => r.id !== requestId);
    saveFriendRequests(newRequests);
    
    loadFriends();
    alert('已添加好友');
}

function rejectFriendRequest(requestId) {
    const requests = getFriendRequests();
    const newRequests = requests.filter(r => r.id !== requestId);
    saveFriendRequests(newRequests);
    loadFriends();
}

function removeFriend(friendId) {
    if (!currentUser) return;
    if (!confirm('确定要删除这个好友吗？')) return;
    
    const friends = getFriends();
    
    // 从当前用户的好友列表删除
    if (friends[currentUser.userId]) {
        friends[currentUser.userId] = friends[currentUser.userId].filter(id => id !== friendId);
    }
    
    // 从对方的好友列表删除
    if (friends[friendId]) {
        friends[friendId] = friends[friendId].filter(id => id !== currentUser.userId);
    }
    
    saveFriends(friends);
    loadFriends();
}

function loadFriends() {
    if (!currentUser) return;
    
    const friends = getFriends();
    const requests = getFriendRequests();
    const users = getAllUsers();
    
    // 显示好友请求
    const requestsSection = document.getElementById('friend-requests-section');
    const requestsList = document.getElementById('friend-requests-list');
    const myRequests = requests.filter(r => r.to === currentUser.userId);
    
    if (myRequests.length > 0) {
        requestsSection.style.display = 'block';
        requestsList.innerHTML = myRequests.map(r => {
            const avatar = getAvatar(r.from);
            const avatarHtml = avatar 
                ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                : r.fromUsername.charAt(0).toUpperCase();
            return `
                <div class="friend-request-item">
                    <div class="friend-avatar">${avatarHtml}</div>
                    <div class="friend-info">
                        <div class="friend-name">${escapeHtml(r.fromUsername)}</div>
                        <div class="friend-id">${r.from}</div>
                        <div class="friend-request-message">${escapeHtml(r.message)}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="friend-btn accept" onclick="acceptFriendRequest('${r.id}')">接受</button>
                        <button class="friend-btn reject" onclick="rejectFriendRequest('${r.id}')">拒绝</button>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        requestsSection.style.display = 'none';
    }
    
    // 显示好友列表
    const friendsList = document.getElementById('friends-list');
    const friendsEmpty = document.getElementById('friends-empty');
    const myFriends = friends[currentUser.userId] || [];
    
    if (myFriends.length === 0) {
        friendsList.innerHTML = '';
        friendsEmpty.style.display = 'block';
        return;
    }
    
    friendsEmpty.style.display = 'none';
    friendsList.innerHTML = myFriends.map(friendId => {
        const user = users[friendId] || { username: '未知用户' };
        const avatar = getAvatar(friendId);
        const avatarHtml = avatar 
            ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : user.username.charAt(0).toUpperCase();
        return `
            <div class="friend-item">
                <div class="friend-avatar">${avatarHtml}</div>
                <div class="friend-info">
                    <div class="friend-name">${escapeHtml(user.username)}</div>
                    <div class="friend-id">${friendId}</div>
                </div>
                <div class="friend-actions">
                    <button class="friend-btn remove" onclick="removeFriend('${friendId}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

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

function handleAuth(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('auth-error');
    
    if (!username) { errorEl.textContent = '请输入名称'; return; }
    if (username.length > MAX_USERNAME_LENGTH) { errorEl.textContent = `用户名最多${MAX_USERNAME_LENGTH}个字符`; return; }
    if (!password) { errorEl.textContent = '请输入密码'; return; }
    
    if (!isLoginMode) {
        // 注册新账号
        if (password.length < 4) { errorEl.textContent = '密码至少4位'; return; }
        if (password !== confirmPassword) { errorEl.textContent = '两次密码不一致'; return; }
        
        const userId = generateUserId();
        const user = { 
            username, 
            userId,
            password: hashPassword(password), 
            createdAt: new Date().toISOString() 
        };
        
        saveUser(userId, user);
        setCurrentUser(userId);
        currentUser = user;
        
        showMainScreen();
    } else {
        // 登录现有账号
        const users = getAllUsers();
        const userIds = Object.keys(users);
        
        // 查找匹配的用户名
        const matchedUserId = userIds.find(id => users[id].username === username);
        if (!matchedUserId) {
            errorEl.textContent = '账号不存在';
            return;
        }
        
        const user = users[matchedUserId];
        if (user.password !== hashPassword(password)) {
            errorEl.textContent = '密码错误';
            return;
        }
        
        setCurrentUser(matchedUserId);
        currentUser = user;
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

function showMainScreen() {
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('main-screen').style.display = 'flex';
    
    document.getElementById('nav-username').textContent = currentUser.username;
    document.getElementById('nav-userid').textContent = currentUser.userId;
    
    document.getElementById('settings-username').textContent = currentUser.username;
    document.getElementById('settings-userid').textContent = currentUser.userId;
    document.getElementById('settings-created').textContent = new Date(currentUser.createdAt).toLocaleDateString('zh-CN');
    
    updateAvatarDisplay();
    loadData();
    loadFriends();
}

function showAuthScreen() {
    document.getElementById('auth-screen').style.display = 'flex';
    document.getElementById('main-screen').style.display = 'none';
    loadAccountList();
}

function logout() {
    if (confirm('确定要退出吗？')) {
        setCurrentUser(null);
        currentUser = null;
        showAuthScreen();
        document.getElementById('auth-form').reset();
    }
}

function switchAccount() {
    if (confirm('确定要切换账号吗？')) {
        setCurrentUser(null);
        currentUser = null;
        showAuthScreen();
        document.getElementById('auth-form').reset();
        if (!isLoginMode) {
            toggleAuthMode();
        }
    }
}

function switchPage(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === 'page-' + pageName);
    });
    
    if (pageName === 'friends') {
        loadFriends();
    }
}

function loadData() {
    loadFeed();
    loadLifeRecords();
    loadWorks();
}

function loadFeed() {
    if (!currentUser) return;
    
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

function createFeedItem(item) {
    const date = new Date(item.date).toLocaleDateString('zh-CN');
    const typeName = item.type === 'life' ? '生活' : '作品';
    const tags = item.tags ? item.tags.map(t => `<span class="feed-tag">#${t}</span>`).join('') : '';
    
    const avatar = getAvatar(currentUser.userId);
    const avatarHtml = avatar 
        ? `<img src="${avatar}" alt="avatar">`
        : `<div class="feed-avatar-text">${currentUser.username.charAt(0).toUpperCase()}</div>`;
    
    let fileHtml = '';
    if (item.image) {
        if (item.fileType && item.fileType.startsWith('image/')) {
            fileHtml = `<div class="feed-image"><img src="${item.image}" alt=""></div>`;
        } else {
            const icon = getFileIcon(item.fileName || '');
            fileHtml = `<a href
