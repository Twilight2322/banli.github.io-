const StorageKeys = { USER: 'site_user', LIFE: 'site_life', WORKS: 'site_works' };
let currentUser = null;
let isLoginMode = false;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

function checkAuth() {
    const savedUser = localStorage.getItem(StorageKeys.USER);
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
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
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });
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
    if (!password) { errorEl.textContent = '请输入密码'; return; }
    
    if (!isLoginMode) {
        if (password.length < 4) { errorEl.textContent = '密码至少4位'; return; }
        if (password !== confirmPassword) { errorEl.textContent = '两次密码不一致'; return; }
        
        const user = { username, password: hashPassword(password), createdAt: new Date().toISOString() };
        localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
        currentUser = user;
        showMainScreen();
    } else {
        const savedUser = localStorage.getItem(StorageKeys.USER);
        if (!savedUser) { errorEl.textContent = '账号不存在'; return; }
        const user = JSON.parse(savedUser);
        if (user.username !== username) { errorEl.textContent = '名称不正确'; return; }
        if (user.password !== hashPassword(password)) { errorEl.textContent = '密码错误'; return; }
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
    document.getElementById('hero-username').textContent = currentUser.username;
    updateGreeting();
    loadData();
    updateStats();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = '你好';
    if (hour < 6) greeting = '夜深了';
    else if (hour < 12) greeting = '早上好';
    else if (hour < 14) greeting = '中午好';
    else if (hour < 18) greeting = '下午好';
    else greeting = '晚上好';
    document.getElementById('hero-greeting').textContent = greeting;
}

function logout() {
    if (confirm('确定要退出吗？')) {
        currentUser = null;
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('auth-form').reset();
    }
}

function switchPage(pageName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
    document.querySelectorAll('.page').forEach(page => {
        page.classList.toggle('active', page.id === 'page-' + pageName);
    });
}

function loadData() { loadLifeRecords(); loadWorks(); }

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

function createCard(item, type) {
    const date = new Date(item.date).toLocaleDateString('zh-CN');
    const tags = item.tags ? item.tags.map(t => '<span class="tag">' + t + '</span>').join('') : '';
    return '<div class="card" onclick="viewItem(\'' + type + '\', \'' + item.id + '\')">' +
        '<div class="card-date">' + date + '</div>' +
        '<div class="card-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="card-content">' + escapeHtml(item.content) + '</div>' +
        (tags ? '<div class="card-tags">' + tags + '</div>' : '') +
        '<div class="card-actions" onclick="event.stopPropagation()">' +
        '<button onclick="editItem(\'' + type + '\', \'' + item.id + '\')">编辑</button>' +
        '<button class="delete-btn" onclick="deleteItem(\'' + type + '\', \'' + item.id + '\')">删除</button>' +
        '</div></div>';
}

function getLifeRecords() {
    const data = localStorage.getItem(StorageKeys.LIFE);
    return data ? JSON.parse(data) : [];
}

function getWorks() {
    const data = localStorage.getItem(StorageKeys.WORKS);
    return data ? JSON.parse(data) : [];
}

function openModal(type, itemId = null) {
    const modal = document.getElementById('modal');
    const form = document.getElementById('modal-form');
    const title = document.getElementById('modal-title');
    form.reset();
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
        }
    }
    modal.classList.add('show');
}

function closeModal(e) {
    if (e && e.target !== document.getElementById('modal')) return;
    document.getElementById('modal').classList.remove('show');
}

function saveItem(e) {
    e.preventDefault();
    const type = document.getElementById('item-type').value;
    const itemId = document.getElementById('item-id').value;
    const title = document.getElementById('item-title').value.trim();
    const content = document.getElementById('item-content').value.trim();
    const date = document.getElementById('item-date').value;
    const tagsInput = document.getElementById('item-tags').value.trim();
    const tags = tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    const item = { id: itemId || generateId(), title, content, date, tags, updatedAt: new Date().toISOString() };
    
    if (type === 'life') {
        const records = getLifeRecords();
        if (itemId) {
            const index = records.findIndex(r => r.id === itemId);
            if (index > -1) records[index] = item;
        } else {
            records.unshift(item);
        }
        localStorage.setItem(StorageKeys.LIFE, JSON.stringify(records));
        loadLifeRecords();
    } else {
        const works = getWorks();
        if (itemId) {
            const index = works.findIndex(w => w.id === itemId);
            if (index > -1) works[index] = item;
        } else {
            works.unshift(item);
        }
        localStorage.setItem(StorageKeys.WORKS, JSON.stringify(works));
        loadWorks();
    }
    closeModal();
    updateStats();
}

function editItem(type, itemId) { openModal(type, itemId); }

function viewItem(type, itemId) {
    const items = type === 'life' ? getLifeRecords() : getWorks();
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    const typeName = type === 'life' ? '生活记录' : '作品';
    const tags = item.tags && item.tags.length ? '\n标签：' + item.tags.join(', ') : '';
    alert(typeName + '\n\n标题：' + item.title + '\n日期：' + new Date(item.date).toLocaleDateString('zh-CN') + '\n\n' + item.content + tags);
}

function deleteItem(type, itemId) {
    if (!confirm('确定要删除吗？')) return;
    if (type === 'life') {
        const records = getLifeRecords().filter(r => r.id !== itemId);
        localStorage.setItem(StorageKeys.LIFE, JSON.stringify(records));
        loadLifeRecords();
    } else {
        const works = getWorks().filter(w => w.id !== itemId);
        localStorage.setItem(StorageKeys.WORKS, JSON.stringify(works));
        loadWorks();
    }
    updateStats();
}

function updateStats() {
    document.getElementById('life-count').textContent = getLifeRecords().length;
    document.getElementById('work-count').textContent = getWorks().length;
    if (currentUser && currentUser.createdAt) {
        const created = new Date(currentUser.createdAt);
        const now = new Date();
        const days = Math.floor((now - created) / (1000 * 60 * 60 * 24)) + 1;
        document.getElementById('days-count').textContent = days;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
