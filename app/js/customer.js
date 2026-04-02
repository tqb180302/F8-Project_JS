import { sidebar } from '../components/sidebar.js';
import { commonTable } from '../components/table.js';

let globalCustomerList = [];
let currentReturnRate = 0;

document.getElementById('sidebar-container').innerHTML = sidebar();

function getInitials(name) {
    if (!name) return 'KH';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const customerColumns = [
    {
        title: 'Khách hàng',
        render: (text, row) => {
            const name = row.name || 'Khách vãng lai';
            return `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #ebf5fb; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #3498db;">${getInitials(name)}</div>
                    <div>
                        <strong>${name}</strong><br>
                        <small style="color: #7f8c8d;">ID: CUST-${row.id || 'N/A'}</small>
                    </div>
                </div>
            `;
        }
    },
    {
        title: 'Liên hệ',
        render: (text, row) => `${row.email || 'Chưa cập nhật'}<br><small style="color: #7f8c8d;">${row.phone || 'Chưa cập nhật'}</small>`
    },
    {
        title: 'Hạng',
        render: (text, row) => {
            const rank = (row.rank || 'BRONZE').toUpperCase();
            let bg = '#d35400'; if (rank === 'GOLD') bg = '#f1c40f'; else if (rank === 'SILVER') bg = '#95a5a6';
            return `<span style="padding: 4px 10px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; color: white; background: ${bg};">${rank}</span>`;
        }
    },
    {
        title: 'Tổng chi tiêu',
        render: (text, row) => `<strong>${(row.realTotalSpending || 0).toLocaleString('vi-VN')}đ</strong>`
    },
    {
        title: 'Thao tác',
        render: (text, row) => `
            <button class="btn-action" onclick="openCustomerModal(${row.id}, '${row.rank || 'BRONZE'}')" title="Sửa hạng" style="border: none; background: #f0f2f5; padding: 8px; border-radius: 6px; cursor: pointer; color: #555;">
                <i class="fas fa-user-edit"></i>
            </button>
        `
    }
];

async function loadCustomers() {
    const token = localStorage.getItem('accessToken');
    if (!token) return window.location.href = '../login.html';

    try {
        const custRes = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/customers', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!custRes.ok) throw new Error("API Khách hàng lỗi");
        const custData = await custRes.json();
        const rawCustomers = Array.isArray(custData) ? custData : (custData.data || []);

        let spendingMap = {};
        let orderCountMap = {};
        try {
            const orderRes = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (orderRes.ok) {
                const orderData = await orderRes.json();
                const rawOrders = Array.isArray(orderData) ? orderData : (orderData.data || []);
                rawOrders.forEach(order => {
                    if (order.customer && order.customer.id && order.status !== 'cancel') {
                        const total = (order.product?.price || 0) * (order.amount || 1);
                        const cid = String(order.customer.id);
                        spendingMap[cid] = (spendingMap[cid] || 0) + total;
                        orderCountMap[cid] = (orderCountMap[cid] || 0) + 1;
                    }
                });
            }
        } catch (e) {
            console.warn("Không lấy được API Đơn hàng, tạm thời tổng tiền = 0");
        }

        globalCustomerList = rawCustomers.map(c => ({
            ...c,
            realTotalSpending: spendingMap[String(c.id)] || 0
        }));

        const returningCount = Object.values(orderCountMap).filter(count => count > 1).length;
        const returnRate = rawCustomers.length > 0
            ? Math.round((returningCount / rawCustomers.length) * 100)
            : 0;

        currentReturnRate = returnRate;
        renderCustomers(globalCustomerList, '', 'ALL', currentReturnRate);

    } catch (error) {
        console.error("Lỗi:", error);
    }
}

function renderCustomers(list, keyword, rankFilter = 'ALL', returnRate = 0) {
    let filteredList = list;

    if (keyword) {
        const lowerKey = keyword.toLowerCase();
        filteredList = filteredList.filter(c => (c.name || '').toLowerCase().includes(lowerKey) || (c.phone || '').includes(lowerKey));
    }
    if (rankFilter !== 'ALL') {
        filteredList = filteredList.filter(c => (c.rank || 'BRONZE').toUpperCase() === rankFilter);
    }

    document.getElementById('summary-container').innerHTML = `
        <div class="card"><h3>Tổng khách hàng</h3><p>${list.length}</p></div>
        <div class="card"><h3>Khách hàng mới (Tháng)</h3><p>${Math.floor(list.length * 0.1) || 0}</p></div>
        <div class="card"><h3>Tỉ lệ quay lại</h3><p>${returnRate}%</p></div>
    `;

    commonTable('#table-container', customerColumns, filteredList);
}

const searchInput = document.getElementById('searchCustomer');
const rankSelect = document.getElementById('rankFilter');

function triggerFilter() {
    const kw = searchInput ? searchInput.value.trim() : '';
    const rk = rankSelect ? rankSelect.value : 'ALL';
    renderCustomers(globalCustomerList, kw, rk, currentReturnRate);
}
if (searchInput) searchInput.addEventListener('input', () => setTimeout(triggerFilter, 500));
if (rankSelect) rankSelect.addEventListener('change', triggerFilter);


window.openCustomerModal = (id, currentRank) => {
    document.getElementById('editCustId').value = id;
    document.getElementById('editCustRank').value = currentRank.toUpperCase();
    document.getElementById('customerModal').style.display = 'flex';
}
window.closeCustomerModal = () => document.getElementById('customerModal').style.display = 'none';

window.saveCustomerRank = async () => {
    const id = document.getElementById('editCustId').value;
    const newRank = document.getElementById('editCustRank').value;
    const token = localStorage.getItem('accessToken');

    let fullCustData = globalCustomerList.find(c => c.id == id);
    if (fullCustData) fullCustData.rank = newRank;

    try {
        const response = await fetch(`https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/customers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(fullCustData)
        });

        if (response.ok) {
            alert('Cập nhật hạng thành công!');
            closeCustomerModal();
            loadCustomers();
        } else {
            alert(`Lỗi Server: ${response.status}`);
        }
    } catch (error) {
        alert('Lỗi mạng!');
    }
}

window.openAddCustomerModal = () => {
    document.getElementById('addCustName').value = '';
    document.getElementById('addCustEmail').value = '';
    document.getElementById('addCustPhone').value = '';
    document.getElementById('addCustomerModal').style.display = 'flex';
}

window.closeAddCustomerModal = () => {
    document.getElementById('addCustomerModal').style.display = 'none';
}

window.saveNewCustomer = async () => {
    const name = document.getElementById('addCustName').value.trim();
    const email = document.getElementById('addCustEmail').value.trim();
    const phone = document.getElementById('addCustPhone').value.trim();
    const token = localStorage.getItem('accessToken');

    if (!name || !email) {
        alert("Vui lòng nhập đầy đủ Tên và Email!");
        return;
    }

    const newCustomer = {
        name: name,
        email: email,
        phone: phone,
        rank: "BRONZE"
    };

    try {
        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/customers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newCustomer)
        });

        if (response.ok) {
            alert('Đã thêm khách hàng mới thành công!');
            closeAddCustomerModal();
            loadCustomers();
        } else {
            const errData = await response.json();
            alert(`Lỗi Server: ${errData.message || response.status}`);
        }
    } catch (error) {
        alert('Lỗi mạng, không thể kết nối tới Server!');
    }
}

loadCustomers();