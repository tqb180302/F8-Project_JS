import { sidebar } from '../components/sidebar.js';
import { commonTable } from '../components/table.js';
let globalOrderList = []

document.getElementById('sidebar-container').innerHTML = sidebar();

const orderColumns = [
    { title: 'Mã đơn', render: (text, row) => `<strong>#ORD-${row.id || 'N/A'}</strong>` },
    {
        title: 'Khách hàng',
        render: (text, row) => {
            const cus = row.customer || {};
            return `${cus.name || 'Khách vãng lai'}<br><small>${cus.phone || ''}</small>`;
        }
    },
    {
        title: 'Sản phẩm',
        render: (text, row) => {
            const prod = row.product || {};
            return `${prod.name || 'Đang cập nhật'} <strong style="color: #e74c3c;">(x${row.amount || 1})</strong>`;
        }
    },
    {
        title: 'Tổng tiền',
        render: (text, row) => {
            const prod = row.product || {};
            const amount = row.amount || 1;
            const total = (prod.price || 0) * amount;
            return `<strong>${total.toLocaleString('vi-VN')}đ</strong>`;
        }
    },
    {
        title: 'Trạng thái',
        render: (text, row) => {
            const status = row.status || 'pending';
            const badges = {
                'pending': '<span class="badge pending">Chờ xử lý</span>',
                'delivering': '<span class="badge shipping">Đang giao</span>',
                'done': '<span class="badge completed">Hoàn thành</span>',
                'cancel': '<span class="badge cancelled">Đã hủy</span>'
            };
            return badges[status] || badges['pending'];
        }
    },
    {
        title: 'Thao tác',
        render: (text, row) => `
            <button class="btn-action" title="Xem chi tiết"><i class="fas fa-eye"></i></button>
            <button class="btn-action" title="Cập nhật" onclick="openOrderModal(${row.id}, '${row.status || 'pending'}')">
                <i class="fas fa-edit"></i>
            </button>
        `
    }
];


window.loadOrders = async function(statusFilter = 'all', searchKeyword = '') {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return window.location.href = '/login.html';

        document.getElementById('table-container').innerHTML = '<p style="color: #7f8c8d; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu đơn hàng từ Server...</p>';

        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const orderList = Array.isArray(data) ? data : (data.data || []);
            globalOrderList = orderList;
            processAndRenderOrders(orderList, statusFilter, searchKeyword);
        } else {
            document.getElementById('table-container').innerHTML = `
                <div style="background: #ffebee; color: #c0392b; padding: 20px; border-radius: 8px;">
                    <strong>API trả về lỗi ${response.status}</strong><br>
                    Vui lòng đăng xuất và đăng nhập lại để làm mới Token!
                </div>
            `;
        }

    } catch (error) {
        document.getElementById('table-container').innerHTML = `
            <div style="background: #ffebee; color: #c0392b; padding: 20px; border-radius: 8px;">
                <strong>Lỗi kết nối mạng:</strong> ${error.message}
            </div>
        `;
    }
}


function processAndRenderOrders(orderList, statusFilter, searchKeyword) {
    const total = orderList.length;
    const pending = orderList.filter(o => o.status === 'pending' || !o.status).length;

    // Đổi chữ tiếng Anh ở đây để nó đếm đúng
    const delivering = orderList.filter(o => o.status === 'delivering').length;
    const done = orderList.filter(o => o.status === 'done').length;
    const cancel = orderList.filter(o => o.status === 'cancel').length;

    document.getElementById('summary-container').innerHTML = `
        <div class="card blue"><h3>Tổng đơn hàng</h3><p>${total}</p></div>
        <div class="card orange"><h3>Chờ xử lý</h3><p>${pending}</p></div>
        <div class="card green"><h3>Thành công</h3><p>${done}</p></div>
        <div class="card red"><h3>Đã hủy</h3><p>${cancel}</p></div>
    `;

    let filteredList = orderList;
    if (statusFilter !== 'all') {
        filteredList = filteredList.filter(o => (o.status || 'pending') === statusFilter);
    }

    if (searchKeyword !== '') {
        filteredList = filteredList.filter(o => {
            const cusName = o.customer ? (o.customer.name || '').toLowerCase() : '';
            const orderId = (o.id || '').toString();
            return cusName.includes(searchKeyword) || orderId.includes(searchKeyword);
        });
    }

    commonTable('#table-container', orderColumns, filteredList);
}


const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        const currentStatus = this.getAttribute('data-status');
        const currentSearch = document.getElementById('searchOrder') ? document.getElementById('searchOrder').value.trim().toLowerCase() : '';
        loadOrders(currentStatus, currentSearch);
    });
});

const searchInput = document.getElementById('searchOrder');
if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const activeTab = document.querySelector('.tab.active');
            const currentStatus = activeTab ? activeTab.getAttribute('data-status') : 'all';
            loadOrders(currentStatus, this.value.trim().toLowerCase());
        }, 500);
    });
}


window.openOrderModal = function(id, currentStatus) {
    document.getElementById('editOrderId').value = id;
    document.getElementById('displayOrderId').innerText = '#' + id;
    document.getElementById('editOrderStatus').value = currentStatus || 'pending';
    document.getElementById('orderModal').style.display = 'flex';
}

window.closeOrderModal = function() {
    document.getElementById('orderModal').style.display = 'none';
}

window.saveOrderStatus = async function() {
    const id = document.getElementById('editOrderId').value;
    const newStatus = document.getElementById('editOrderStatus').value;
    const token = localStorage.getItem('accessToken');


    let fullOrderData = globalOrderList.find(o => o.id == id);


    let updatePayload = {
        status: newStatus
    };

    if (fullOrderData) {
        updatePayload.amount = fullOrderData.amount || 1;

        if (fullOrderData.product && fullOrderData.product.id) {
            updatePayload.productId = fullOrderData.product.id;
        }

        if (fullOrderData.customer && fullOrderData.customer.id) {
            updatePayload.customerId = fullOrderData.customer.id;
        }
    }

    try {
        const response = await fetch(`https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/orders/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatePayload)
        });

        if (response.ok) {
            alert('Cập nhật trạng thái thành công!');
            closeOrderModal();
            const activeTab = document.querySelector('.tab.active');
            const currentStatusFilter = activeTab ? activeTab.getAttribute('data-status') : 'all';
            loadOrders(currentStatusFilter);
        } else {
            const errorData = await response.json();
            alert(`Lỗi ${response.status}: ${errorData.message || errorData.error || 'Sai định dạng dữ liệu'}`);
            closeOrderModal();
        }
    } catch (error) {
        console.error("Lỗi:", error);
        alert('Có lỗi mạng xảy ra!');
        closeOrderModal();
    }
}


loadOrders();