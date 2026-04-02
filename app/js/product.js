import { sidebar } from '../components/sidebar.js';
import { createSummary } from '../components/summary.js';
import { commonTable } from '../components/table.js';


document.getElementById('sidebar-container').innerHTML = sidebar();

let soLuongSP = 0;
let sapHetHang = 0;
let soDanhMuc = 0;

window.capNhatThongKe = function() {
    const summaryData = [
        { cardColor: "", title: "Tổng sản phẩm", value: soLuongSP.toLocaleString() },
        { cardColor: "", title: "Sắp hết hàng", value: sapHetHang.toLocaleString(), valueColor: "text-danger" },
        { cardColor: "", title: "Danh mục", value: soDanhMuc.toLocaleString() }
    ];

    const container = document.getElementById('summary-container');
    container.innerHTML = '';
    container.appendChild(createSummary(summaryData));
}

capNhatThongKe();


const productColumns = [
    {
        title: 'Hình',
        render: (text, row) => {
            const fallbackImg = 'https://placehold.co/50x50?text=No+Image';
            const imgUrl = row.imageUrl || fallbackImg;
            return `<img src="${imgUrl}" onerror="this.onerror=null; this.src='${fallbackImg}';" alt="sp" class="img-thumb" style="width:50px; height:50px; object-fit:cover; border-radius:5px;">`;
        }
    },
    {
        title: 'Thông tin sản phẩm',
        render: (text, row) => `<strong>${row.name}</strong><br><small>SKU: ${row.sku || 'N/A'}</small>`
    },
    {
        title: 'Danh mục',
        render: (text, row) => row.category?.name || 'Chưa phân loại'
    },
    {
        title: 'Giá bán',
        render: (text, row) => {
            const price = row.price ? row.price.toLocaleString('vi-VN') : '0';
            return `${price}đ`;
        }
    },
    { title: 'Tồn kho', dataIndex: 'remaining' },
    {
        title: 'Thao tác',
        render: (text, row) => `
        <a href="edit.html?id=${row.id}" class="btn-icon edit">
            <i class="fas fa-edit"></i>
        </a>
        <button class="btn-icon delete" onclick="deleteProduct(${row.id})">
            <i class="fas fa-trash"></i>
        </button>
    `
    }
];


window.loadProducts = async function() {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/products', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem('accessToken');
            window.location.href = '/login.html';
            return;
        }

        if (response.ok) {
            const data = await response.json();
            let productList = Array.isArray(data) ? data : (data.data || []);

            soLuongSP = productList.length;
            sapHetHang = productList.filter(sp => sp.remaining <= 3).length; //
            capNhatThongKe();


            const categoryId = document.getElementById('categoryFilter') ? document.getElementById('categoryFilter').value : 'all';
            const searchKeyword = document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim().toLowerCase() : '';


            if (categoryId !== 'all') {
                productList = productList.filter(p => {
                    const maDanhMucCuaSP = p.categoryId || (p.category && p.category.id);
                    return maDanhMucCuaSP == categoryId;
                });
            }


            if (searchKeyword !== '') {
                productList = productList.filter(p => {
                    const tenSP = (p.name || '').toLowerCase();
                    const maSKU = (p.sku || '').toLowerCase();
                    return tenSP.includes(searchKeyword) || maSKU.includes(searchKeyword);
                });
            }


            commonTable('#table-container', productColumns, productList);
        }

    } catch (error) {
        console.error("Lỗi khi kéo dữ liệu Sản phẩm:", error);
        document.getElementById('table-container').innerHTML = '<p style="color:red;">Lỗi kết nối mạng, không thể tải dữ liệu!</p>';
    }
}


async function loadCategoriesForFilter() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/categories', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            const categoryList = Array.isArray(data) ? data : (data.data || []);

            soDanhMuc = categoryList.length;
            capNhatThongKe();

            const filterSelect = document.getElementById('categoryFilter');

            if(filterSelect) {
                filterSelect.innerHTML = '<option value="all">Tất cả danh mục</option>';
                categoryList.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    filterSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error("Lỗi khi tải bộ lọc danh mục:", error);
    }
}

const selectBoLoc = document.getElementById('categoryFilter');
if (selectBoLoc) {
    selectBoLoc.addEventListener('change', function() {
        loadProducts();
    });
}

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    let timeout = null;
    searchInput.addEventListener('input', function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            loadProducts();
        }, 500);
    });
}



window.deleteProduct = async function(id) {
    const ConfirmDelete = confirm(`Bạn có chắc chắn muốn xóa sản phẩm này không?`);
    if (!ConfirmDelete) return;

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            alert("Phiên đăng nhập hết hạn!");
            window.location.href = '/login.html';
            return;
        }

        if (response.ok) {
            alert('Xóa sản phẩm thành công!');
            loadProducts();
        } else {
            alert('Xóa thất bại. Có lỗi từ máy chủ!');
        }

    } catch (error) {
        console.error("Lỗi khi xóa:", error);
        alert("Lỗi kết nối mạng!");
    }
};

loadCategoriesForFilter();
loadProducts();