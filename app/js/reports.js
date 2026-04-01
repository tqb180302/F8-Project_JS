import { sidebar } from '../components/sidebar.js';


document.getElementById('sidebar-container').innerHTML = sidebar();


let barChartInstance = null;
let pieChartInstance = null;

async function loadReportData() {
    const token = localStorage.getItem('accessToken');
    if (!token) return window.location.href = '../login.html';

    try {

        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const rawOrders = Array.isArray(data) ? data : (data.data || []);

            processReport(rawOrders);
        } else {
            console.error("Lỗi API:", response.status);
            alert("Lỗi tải dữ liệu báo cáo!");
        }

    } catch (error) {
        console.error("Lỗi mạng:", error);
    }
}

function processReport(orders) {
    let totalRevenue = 0;
    let doneCount = 0;
    let deliveringCount = 0;
    let cancelCount = 0;
    let pendingCount = 0;
    let totalItemsSold = 0;

    const productStats = {};

    orders.forEach(order => {
        const status = order.status || 'pending';
        const price = order.product?.price || 0;
        const amount = order.amount || 1;
        const orderTotal = price * amount;
        const productName = order.product?.name || 'Sản phẩm không xác định';

        if (status === 'done') doneCount++;
        else if (status === 'delivering') deliveringCount++;
        else if (status === 'cancel') cancelCount++;
        else pendingCount++;

        if (status === 'done' || status === 'delivering') {
            totalRevenue += orderTotal;
            totalItemsSold += amount;

            if (!productStats[productName]) {
                productStats[productName] = { price: price, qty: 0, revenue: 0 };
            }
            productStats[productName].qty += amount;
            productStats[productName].revenue += orderTotal;
        }
    });

    document.getElementById('totalRevenue').innerText = `${totalRevenue.toLocaleString('vi-VN')}đ`;
    document.getElementById('totalOrdersDone').innerText = doneCount;
    document.getElementById('totalOrdersDelivering').innerText = deliveringCount;
    document.getElementById('totalProductsSold').innerText = totalItemsSold;

    drawPieChart(doneCount, deliveringCount, pendingCount, cancelCount);

    const sortedProducts = Object.keys(productStats).map(name => {
        return { name: name, ...productStats[name] };
    }).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    renderTopProductsTable(sortedProducts);


    drawBarChart(sortedProducts);
}

function renderTopProductsTable(topProducts) {
    const tbody = document.getElementById('topProductsTable');
    let html = '';

    if(topProducts.length === 0) {
        html = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Chưa có dữ liệu bán hàng</td></tr>';
    } else {
        topProducts.forEach(prod => {
            html += `
                <tr>
                    <td><strong>${prod.name}</strong></td>
                    <td>${prod.price.toLocaleString('vi-VN')}đ</td>
                    <td><strong style="color: #3498db;">x${prod.qty}</strong></td>
                    <td><strong>${prod.revenue.toLocaleString('vi-VN')}đ</strong></td>
                </tr>
            `;
        });
    }
    tbody.innerHTML = html;
}


function drawPieChart(done, delivering, pending, cancel) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (pieChartInstance) pieChartInstance.destroy();

    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Hoàn thành', 'Đang giao', 'Chờ xử lý', 'Đã hủy'],
            datasets: [{
                data: [done, delivering, pending, cancel],
                backgroundColor: ['#2ecc71', '#3498db', '#f1c40f', '#e74c3c']
            }]
        }
    });
}

function drawBarChart(topProducts) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (barChartInstance) barChartInstance.destroy();

    const labels = topProducts.map(p => p.name.length > 15 ? p.name.substring(0,15)+'...' : p.name);
    const data = topProducts.map(p => p.revenue);

    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Doanh thu mang lại (VNĐ)',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: '#3498db',
                borderWidth: 1
            }]
        },
        options: {
            scales: { y: { beginAtZero: true } }
        }
    });
}


loadReportData();