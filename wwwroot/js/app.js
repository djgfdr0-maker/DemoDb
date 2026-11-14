let currentPackage = 'premium';
let currentRole = 'Administrator';
let activeTab = 'database';
let cachedData = null;
let activityChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    await fetchSessionInfo();
    loadView('database');
});

async function fetchSessionInfo() {
    try {
        const res = await fetch('/api/session');
        const data = await res.json();
        currentPackage = data.currentPackage;
        currentRole = data.currentRole;
        document.getElementById('visitor-id-display').innerText = data.userId;
        document.getElementById('visitor-avatar-initial').innerText = data.userId.replace('User #', '');
        document.getElementById('uptime-display').innerText = `Uptime: ${data.uptime}`;
        updateUIState();
    } catch(e) { console.error(e); }
}

async function updateSessionBackend() {
    await fetch('/api/session/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: currentPackage, role: currentRole })
    });
}

function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('aside nav a').forEach(el => {
        el.className = "flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition";
    });
    document.getElementById(`nav-${tab}`).className = "flex items-center space-x-3 px-3.5 py-2.5 rounded-lg bg-blue-600 text-white font-medium transition shadow-lg shadow-blue-600/20";
    loadView(tab);
}

async function loadView(tab) {
    const container = document.getElementById('main-view-container');
    const titleEl = document.getElementById('page-title');
    const subtitleEl = document.getElementById('page-subtitle');

    if (tab === 'database') {
        titleEl.innerText = "Database Management";
        subtitleEl.innerText = `Active Package: ${currentPackage.toUpperCase()} | Role: ${currentRole}`;
        const res = await fetch('/api/dashboard');
        cachedData = await res.json();
        renderDatabaseView(container, cachedData);
    } 
    else if (tab === 'schema') {
        titleEl.innerText = "Database Schema Architecture";
        subtitleEl.innerText = "Interactive Entity-Relationship Diagram (ERD) & Foreign Key Constraints";
        renderSchemaView(container);
    }
    else if (tab === 'security') {
        titleEl.innerText = "Security & Automation";
        subtitleEl.innerText = "RBAC permissions and background cron automation workflows";
        const res = await fetch('/api/security');
        const secData = await res.json();
        renderSecurityView(container, secData);
    }
    else if (tab === 'analytics') {
        titleEl.innerText = "System Analytics";
        subtitleEl.innerText = "Real-time performance metrics and query telemetry";
        const res = await fetch('/api/analytics');
        const metrics = await res.json();
        renderAnalyticsView(container, metrics);
    }
    else if (tab === 'logs') {
        titleEl.innerText = "Audit Logs";
        subtitleEl.innerText = "Complete traceability of user actions and security events";
        const res = await fetch('/api/security');
        const secData = await res.json();
        renderLogsView(container, secData.logs);
    }
}

function renderDatabaseView(container, data) {
    let addEntryBtnHtml = '';
    if (currentRole !== 'Viewer') {
        addEntryBtnHtml = `<button onclick="openAddModal()" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 font-semibold text-xs rounded-lg transition shadow-lg shadow-blue-600/20"><i class="fa-solid fa-plus mr-1.5"></i>Add Entry</button>`;
    } else {
        addEntryBtnHtml = `<span class="text-xs text-amber-400"><i class="fa-solid fa-lock mr-1"></i>Viewer: Read-only mode</span>`;
    }

    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="glass-card p-5 flex items-center justify-between">
                <div><p class="text-xs text-gray-400">Total Entries</p><h3 class="text-xl font-bold mt-1">${data.stats.totalEntries.toLocaleString()}</h3><span class="text-[11px] text-emerald-400 font-medium">+2.4%</span></div>
                <div class="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-lg"><i class="fa-solid fa-database"></i></div>
            </div>
            <div class="glass-card p-5 flex items-center justify-between">
                <div><p class="text-xs text-gray-400">Unique Users</p><h3 class="text-xl font-bold mt-1">${data.stats.uniqueUsers.toLocaleString()}</h3><span class="text-[11px] text-emerald-400 font-medium">+1.1%</span></div>
                <div class="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-lg"><i class="fa-solid fa-users"></i></div>
            </div>
            <div class="glass-card p-5 flex items-center justify-between">
                <div><p class="text-xs text-gray-400">Storage Allocated</p><h3 class="text-xl font-bold mt-1">${data.stats.totalSize}</h3><span class="text-[11px] text-blue-400 font-medium">${currentPackage.toUpperCase()} Tier</span></div>
                <div class="w-12 h-12 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-lg"><i class="fa-solid fa-hard-drive"></i></div>
            </div>
            <div class="glass-card p-5 flex items-center justify-between">
                <div><p class="text-xs text-gray-400">Package Tier</p><h3 class="text-xl font-bold mt-1 uppercase text-blue-400">${currentPackage}</h3><span class="text-[11px] text-gray-400">${currentPackage === 'standard' ? 'Standard Features' : currentPackage === 'premium' ? 'All Pro Features Unlocked' : 'Basic Restricted'}</span></div>
                <div class="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg"><i class="fa-solid fa-crown"></i></div>
            </div>
        </div>

        ${currentPackage === 'basic' ? `
            <div class="glass-card p-4 border-l-4 border-amber-500 bg-amber-950/10 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fa-solid fa-triangle-exclamation text-amber-400 text-lg"></i>
                    <div><h4 class="font-bold text-xs text-amber-300">Basic Tier Limitations Active</h4><p class="text-[11px] text-gray-400">Advanced graphs and triggers are locked in Basic. Upgrade to Standard ($120) or Premium ($260) to unlock.</p></div>
                </div>
                <button onclick="changePackage('standard');" class="px-3 py-1.5 bg-amber-500 text-black font-bold text-xs rounded hover:bg-amber-400 transition">Test Standard</button>
            </div>
        ` : ''}

        ${currentPackage === 'standard' ? `
            <div class="glass-card p-4 border-l-4 border-blue-500 bg-blue-950/10 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fa-solid fa-circle-info text-blue-400 text-lg"></i>
                    <div><h4 class="font-bold text-xs text-blue-300">Standard Tier Active</h4><p class="text-[11px] text-gray-400">Standard features enabled. Upgrade to Premium to unlock custom AI telemetry and priority database indexing.</p></div>
                </div>
                <button onclick="changePackage('premium');" class="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-500 transition">Unlock Premium</button>
            </div>
        ` : ''}

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="glass-card p-5 lg:col-span-2 flex flex-col justify-between">
                <div class="flex items-center justify-between mb-4"><h3 class="font-bold text-sm"><i class="fa-solid fa-chart-line text-blue-400 mr-2"></i>Database Activity</h3><span class="text-xs text-gray-400">Last 7 days</span></div>
                <div class="h-64 relative"><canvas id="activityChart"></canvas></div>
            </div>
            <div class="glass-card p-5 flex flex-col justify-between">
                <h3 class="font-bold text-sm mb-4"><i class="fa-solid fa-chart-pie text-blue-400 mr-2"></i>Data Distribution</h3>
                <div class="h-48 relative flex items-center justify-center"><canvas id="distributionChart"></canvas></div>
            </div>
        </div>

        <div class="glass-card p-5 space-y-4">
            <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h3 class="font-bold text-sm"><i class="fa-solid fa-list text-blue-400 mr-2"></i>Recent Entries (${data.entries.length})</h3>
                <div class="flex items-center space-x-2">${addEntryBtnHtml}</div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-[#070a12] text-gray-400 border-b border-blue-900/20">
                        <tr><th class="p-3">ID</th><th class="p-3">Name</th><th class="p-3">Type</th><th class="p-3">Created At</th><th class="p-3">Status</th><th class="p-3 text-right">Actions</th></tr>
                    </thead>
                    <tbody class="divide-y divide-blue-900/10">
                        ${data.entries.map(e => `
                            <tr class="hover:bg-blue-950/20 transition">
                                <td class="p-3 font-semibold text-blue-400">${e.entryCode}</td>
                                <td class="p-3">${e.name}</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 text-[10px]">${e.type}</span></td>
                                <td class="p-3 text-gray-400">${e.createdAt}</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 text-[10px]">Active</span></td>
                                <td class="p-3 text-right space-x-2">
                                    <button onclick="viewEntryDetail('${e.entryCode}', '${e.name}', '${e.type}', '${e.createdAt}')" class="text-gray-400 hover:text-white" title="View"><i class="fa-regular fa-eye"></i></button>
                                    ${currentRole === 'Administrator' ? `<button onclick="deleteEntry(${e.id})" class="text-gray-400 hover:text-red-400" title="Delete"><i class="fa-regular fa-trash-can"></i></button>` : '<span class="text-gray-600 text-[10px]">Locked</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    if (currentPackage !== 'basic') renderCharts(data);
}

function renderCharts(data) {
    const ctx = document.getElementById('activityChart').getContext('2d');
    if (activityChartInstance) activityChartInstance.destroy();
    activityChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: data.activityChart.labels, datasets: [{ data: data.activityChart.values, borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af' } }, y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#9ca3af' } } } }
    });
    const ctxDist = document.getElementById('distributionChart').getContext('2d');
    new Chart(ctxDist, {
        type: 'doughnut',
        data: { labels: data.distribution.map(d => d.label), datasets: [{ data: data.distribution.map(d => d.percentage), backgroundColor: data.distribution.map(d => d.color), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '75%' }
    });
}

function viewEntryDetail(code, name, type, date) {
    alert(`Entry Details:\n\nCode: ${code}\nName: ${name}\nType: ${type}\nTimestamp: ${date}\nStatus: Active (Encrypted DB Record)`);
}

function renderSchemaView(container) {
    container.innerHTML = `
        <div class="glass-card p-6 space-y-6">
            <div class="flex items-center justify-between border-b border-blue-900/20 pb-4">
                <div><h3 class="font-bold text-base">Entity-Relationship Diagram (ERD Schema)</h3><p class="text-xs text-gray-400">Visual database tables, relationships, and foreign key mappings</p></div>
                <div class="flex space-x-2 text-xs"><span class="px-3 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">5 Normalized Tables</span></div>
            </div>
            
            <!-- Visually Rich ERD Boxes Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="glass-card p-4 border-t-4 border-t-blue-500 space-y-3">
                    <div class="flex justify-between items-center"><span class="font-bold text-blue-400 text-sm"><i class="fa-solid fa-table mr-2"></i>users</span><span class="text-[10px] bg-blue-900/40 px-2 py-0.5 rounded text-blue-300">Entity</span></div>
                    <ul class="text-xs space-y-1.5 text-gray-300 font-mono">
                        <li class="flex justify-between text-blue-300"><span>🔑 id</span><span>INT (PK)</span></li>
                        <li class="flex justify-between"><span>username</span><span>VARCHAR(50)</span></li>
                        <li class="flex justify-between"><span>email</span><span>VARCHAR(100)</span></li>
                        <li class="flex justify-between text-purple-400"><span>⚡ role_id</span><span>INT (FK)</span></li>
                    </ul>
                </div>
                <div class="glass-card p-4 border-t-4 border-t-indigo-500 space-y-3">
                    <div class="flex justify-between items-center"><span class="font-bold text-indigo-400 text-sm"><i class="fa-solid fa-table mr-2"></i>roles</span><span class="text-[10px] bg-indigo-900/40 px-2 py-0.5 rounded text-indigo-300">Entity</span></div>
                    <ul class="text-xs space-y-1.5 text-gray-300 font-mono">
                        <li class="flex justify-between text-indigo-300"><span>🔑 id</span><span>INT (PK)</span></li>
                        <li class="flex justify-between"><span>name</span><span>VARCHAR(50)</span></li>
                        <li class="flex justify-between"><span>permissions</span><span>JSON</span></li>
                    </ul>
                </div>
                <div class="glass-card p-4 border-t-4 border-t-emerald-500 space-y-3">
                    <div class="flex justify-between items-center"><span class="font-bold text-emerald-400 text-sm"><i class="fa-solid fa-table mr-2"></i>orders</span><span class="text-[10px] bg-emerald-900/40 px-2 py-0.5 rounded text-emerald-300">Entity</span></div>
                    <ul class="text-xs space-y-1.5 text-gray-300 font-mono">
                        <li class="flex justify-between text-emerald-300"><span>🔑 id</span><span>INT (PK)</span></li>
                        <li class="flex justify-between text-purple-400"><span>⚡ user_id</span><span>INT (FK)</span></li>
                        <li class="flex justify-between"><span>total_amount</span><span>DECIMAL</span></li>
                    </ul>
                </div>
                <div class="glass-card p-4 border-t-4 border-t-amber-500 space-y-3">
                    <div class="flex justify-between items-center"><span class="font-bold text-amber-400 text-sm"><i class="fa-solid fa-table mr-2"></i>order_items</span><span class="text-[10px] bg-amber-900/40 px-2 py-0.5 rounded text-amber-300">Junction</span></div>
                    <ul class="text-xs space-y-1.5 text-gray-300 font-mono">
                        <li class="flex justify-between text-amber-300"><span>🔑 id</span><span>INT (PK)</span></li>
                        <li class="flex justify-between text-purple-400"><span>⚡ order_id</span><span>INT (FK)</span></li>
                        <li class="flex justify-between text-purple-400"><span>⚡ product_id</span><span>INT (FK)</span></li>
                    </ul>
                </div>
                <div class="glass-card p-4 border-t-4 border-t-purple-500 space-y-3">
                    <div class="flex justify-between items-center"><span class="font-bold text-purple-400 text-sm"><i class="fa-solid fa-table mr-2"></i>products</span><span class="text-[10px] bg-purple-900/40 px-2 py-0.5 rounded text-purple-300">Entity</span></div>
                    <ul class="text-xs space-y-1.5 text-gray-300 font-mono">
                        <li class="flex justify-between text-purple-300"><span>🔑 id</span><span>INT (PK)</span></li>
                        <li class="flex justify-between"><span>name</span><span>VARCHAR(100)</span></li>
                        <li class="flex justify-between"><span>price</span><span>DECIMAL</span></li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function renderSecurityView(container, secData) {
    let addRoleBtnHtml = currentRole === 'Administrator' ? `<button onclick="openAddRoleModal()" class="px-3 py-1.5 bg-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-500 transition"><i class="fa-solid fa-plus mr-1"></i>Add Role</button>` : '';

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="glass-card p-5 lg:col-span-2 space-y-4">
                <div class="flex items-center justify-between">
                    <h3 class="font-bold text-sm"><i class="fa-solid fa-shield-halved text-blue-400 mr-2"></i>Role-Based Access Control (RBAC)</h3>
                    ${addRoleBtnHtml}
                </div>
                <table class="w-full text-left text-xs">
                    <thead class="bg-[#070a12] text-gray-400 border-b border-blue-900/20"><tr><th class="p-3">Role</th><th class="p-3">Permissions</th><th class="p-3">Access Level</th></tr></thead>
                    <tbody class="divide-y divide-blue-900/10">
                        <tr class="${currentRole === 'Administrator' ? 'bg-blue-950/20 font-bold' : ''}">
                            <td class="p-3 text-purple-400">Administrator</td>
                            <td class="p-3 space-x-1"><span class="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 text-[10px]">Read</span><span class="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 text-[10px]">Write</span><span class="px-2 py-0.5 rounded bg-purple-900/30 text-purple-300 text-[10px]">Manage</span></td>
                            <td class="p-3 text-gray-300">Full System Access</td>
                        </tr>
                        <tr class="${currentRole === 'Editor' ? 'bg-blue-950/20 font-bold' : ''}">
                            <td class="p-3 text-blue-400">Editor</td>
                            <td class="p-3 space-x-1"><span class="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 text-[10px]">Read</span><span class="px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 text-[10px]">Write</span></td>
                            <td class="p-3 text-gray-300">Data Modification Only</td>
                        </tr>
                        <tr class="${currentRole === 'Viewer' ? 'bg-blue-950/20 font-bold' : ''}">
                            <td class="p-3 text-emerald-400">Viewer</td>
                            <td class="p-3 space-x-1"><span class="px-2 py-0.5 rounded bg-blue-900/30 text-blue-300 text-[10px]">Read</span></td>
                            <td class="p-3 text-gray-300">Read-Only Access</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="glass-card p-5 space-y-4">
                <h3 class="font-bold text-sm"><i class="fa-solid fa-bolt text-blue-400 mr-2"></i>Automated Workflows</h3>
                <div class="space-y-3">
                    ${secData.automations.map(a => `
                        <div class="p-3 rounded-lg bg-[#070a12] border border-blue-900/20 flex items-center justify-between">
                            <div><span class="block font-semibold text-xs">${a.title}</span><span class="text-[10px] text-gray-400">${a.description}</span></div>
                            <button onclick="toggleAutomation(${a.id})" class="w-10 h-5 rounded-full ${a.isEnabled ? 'bg-blue-600 justify-end' : 'bg-gray-700 justify-start'} flex items-center p-0.5 transition">
                                <span class="w-4 h-4 rounded-full bg-white shadow"></span>
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderAnalyticsView(container, metrics) {
    container.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            ${metrics.map(m => `
                <div class="glass-card p-5 space-y-2">
                    <p class="text-xs text-gray-400">${m.metricName}</p>
                    <h3 class="text-2xl font-bold text-blue-400">${m.metricValue}</h3>
                    <span class="text-[11px] text-emerald-400 font-medium">${m.change} vs last cycle</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderLogsView(container, logs) {
    container.innerHTML = `
        <div class="glass-card p-5 space-y-4">
            <h3 class="font-bold text-sm"><i class="fa-solid fa-rectangle-list text-blue-400 mr-2"></i>Audit Trail Logs</h3>
            <table class="w-full text-left text-xs">
                <thead class="bg-[#070a12] text-gray-400 border-b border-blue-900/20"><tr><th class="p-3">Time</th><th class="p-3">Role</th><th class="p-3">Action</th><th class="p-3">Details</th><th class="p-3">Status</th></tr></thead>
                <tbody class="divide-y divide-blue-900/10">
                    ${logs.map(l => `
                        <tr class="hover:bg-blue-950/20 transition">
                            <td class="p-3 text-gray-400">${l.time}</td>
                            <td class="p-3 font-semibold text-blue-300">${l.user}</td>
                            <td class="p-3">${l.action}</td>
                            <td class="p-3 text-gray-300">${l.details}</td>
                            <td class="p-3"><span class="px-2 py-0.5 rounded ${l.status === 'Success' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-amber-900/30 text-amber-400'} text-[10px]">${l.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// SIMULATOR & MODALS
function toggleSimulatorModal() {
    const modal = document.getElementById('simulator-modal');
    modal.classList.toggle('hidden');
    modal.classList.toggle('flex');
}

async function changePackage(pkg) {
    currentPackage = pkg;
    await updateSessionBackend();
    updateUIState();
    loadView(activeTab);
}

async function changeRole(role) {
    currentRole = role;
    await updateSessionBackend();
    updateUIState();
    loadView(activeTab);
}

function updateUIState() {
    ['basic', 'standard', 'premium'].forEach(p => {
        const btn = document.getElementById(`pkg-${p}`);
        if(btn) {
            if(p === currentPackage) {
                btn.className = "p-3 rounded-lg border border-blue-500 bg-blue-600/10 text-center transition";
                btn.querySelector('span:first-child').className = "block font-bold text-xs text-blue-400";
            } else {
                btn.className = "p-3 rounded-lg border border-blue-900/20 text-center transition text-gray-400";
                btn.querySelector('span:first-child').className = "block font-bold text-xs";
            }
        }
    });

    ['Administrator', 'Editor', 'Viewer'].forEach(r => {
        const btn = document.getElementById(`role-${r}`);
        if(btn) {
            if(r === currentRole) {
                btn.className = "p-2.5 rounded-lg border border-blue-500 bg-blue-600/10 text-center text-xs font-medium transition text-white";
            } else {
                btn.className = "p-2.5 rounded-lg border border-blue-900/20 text-center text-xs font-medium transition text-gray-400";
            }
        }
    });

    const badge = document.getElementById('current-role-badge');
    if(badge) badge.innerText = `${currentRole} (${currentPackage.substring(0,3).toUpperCase()})`;
}

function toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    dropdown.classList.toggle('hidden');
}

function openAddModal() {
    if (currentRole === 'Viewer') { alert('Permission Denied: Viewers cannot add entries.'); return; }
    document.getElementById('add-entry-modal').classList.remove('hidden');
    document.getElementById('add-entry-modal').classList.add('flex');
}
function closeAddModal() {
    document.getElementById('add-entry-modal').classList.add('hidden');
    document.getElementById('add-entry-modal').classList.remove('flex');
}

function openAddRoleModal() {
    document.getElementById('add-role-modal').classList.remove('hidden');
    document.getElementById('add-role-modal').classList.add('flex');
}
function closeAddRoleModal() {
    document.getElementById('add-role-modal').classList.add('hidden');
    document.getElementById('add-role-modal').classList.remove('flex');
}

async function submitNewEntry() {
    const name = document.getElementById('new-entry-name').value;
    const type = document.getElementById('new-entry-type').value;
    await fetch('/api/entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, type }) });
    closeAddModal();
    loadView('database');
}

async function deleteEntry(id) {
    if (currentRole !== 'Administrator') { alert('Permission Denied: Only Administrators can delete records.'); return; }
    await fetch(`/api/entries/${id}`, { method: 'DELETE' });
    loadView('database');
}

async function toggleAutomation(id) {
    if (currentRole === 'Viewer') { alert('Permission Denied: Viewers cannot modify security or automation workflows.'); return; }
    if (currentPackage === 'basic') { alert('Upgrade to Standard or Premium to control automated workflows.'); return; }
    await fetch(`/api/automations/${id}/toggle`, { method: 'POST' });
    loadView('security');
}