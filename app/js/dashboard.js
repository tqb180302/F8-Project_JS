import { sidebar } from '../components/sidebar.js';
import { commonTable } from '../components/table.js';

// 1. RENDER SIDEBAR
document.getElementById('sidebar-container').innerHTML = sidebar();

// 2. CẤU HÌNH CỘT BẢNG
const orderColumns = [
    { title: 'Mã đơn', render: (text, row) => `#${row.id || 'N/A'}` },
    {
        title: 'Khách hàng',
        render: (text, row) => {
            const cus = row.customer || {};
            return cus.name || row.customerName || 'Khách vãng lai';
        }
    },
    {
        title: 'Trạng thái',
        render: (text, row) => {
            const status = row.status || 'pending';
            const badges = {
                'pending': '<span style="padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; background: #fff3e0; color: #e67e22;">Chờ xử lý</span>',
                'delivering': '<span style="padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; background: #e1f5fe; color: #0288d1;">Đang giao</span>',
                'done': '<span style="padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; background: #e8f5e9; color: #27ae60;">Hoàn thành</span>',
                'cancel': '<span style="padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; background: #ffebee; color: #c0392b;">Đã hủy</span>'
            };
            return badges[status] || badges['pending'];
        }
    },
    {
        title: 'Tổng tiền',
        render: (text, row) => {
            const prod = row.product || {};
            const amount = row.amount || 1;
            const total = (prod.price || 0) * amount || row.total || row.price || 0;
            return `<strong>${total.toLocaleString('vi-VN')}đ</strong>`;
        }
    }
];


async function loadDashboard() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/orders', {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        const orderList = Array.isArray(data) ? data : (data.data || []);

        renderDashboard(orderList);
    } else {
        renderDashboard([]);
    }
}

function renderDashboard(orderList) {
    const totalRevenue = orderList.reduce((sum, row) => {
        const prod = row.product || {};
        const amount = row.amount || 1;
        const itemTotal = (prod.price || 0) * amount || row.total || row.price || 0;
        return sum + itemTotal;
    }, 0);

    const totalOrders = orderList.length;

    const summaryDOM = `
        <div class="card" style="border-left-color: #3498db;">
            <h3>Doanh thu</h3>
            <p style="color: #2c3e50;">${totalRevenue.toLocaleString('vi-VN')}đ</p>
        </div>
        <div class="card" style="border-left-color: #3498db;">
            <h3>Đơn mới</h3>
            <p style="color: #2c3e50;">${totalOrders}</p>
        </div>
    `;
    document.getElementById('summary-container').innerHTML = summaryDOM;

    const recentOrders = orderList.slice(0, 5);
    commonTable('#table-container', orderColumns, recentOrders);
}

loadDashboard();