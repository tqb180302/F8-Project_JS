import { sidebar } from '../components/sidebar.js';


document.getElementById('sidebar-container').innerHTML = sidebar();


const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) {
    alert("Không tìm thấy ID sản phẩm!");
    window.location.href = 'index.html';
}


async function loadProductData() {
    try {
        const token = localStorage.getItem('accessToken');


        await loadCategories();


        const response = await fetch(`https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/products/${productId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const product = await response.json();


            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('remaining').value = product.remaining;
            document.getElementById('sku').value = product.sku || '';
            document.getElementById('description').value = product.description || '';
            document.getElementById('imageUrl').value = product.imageUrl || '';
            document.getElementById('categoryId').value = product.categoryId;


            if (product.imageUrl) {
                document.getElementById('imgPreview').src = product.imageUrl;
            }
        }
    } catch (error) {
        console.error("Lỗi khi load dữ liệu cũ:", error);
    }
}


async function loadCategories() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
        const data = await response.json();
        const categoryList = Array.isArray(data) ? data : (data.data || []);
        const select = document.getElementById('categoryId');
        select.innerHTML = '';
        categoryList.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            select.appendChild(opt);
        });
    }
}


loadProductData();


const form = document.getElementById('productForm');
form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const payload = {
        name: document.getElementById('name').value,
        price: Number(document.getElementById('price').value),
        remaining: Number(document.getElementById('remaining').value),
        sku: document.getElementById('sku').value,
        description: document.getElementById('description').value,
        imageUrl: document.getElementById('imageUrl').value,
        categoryId: Number(document.getElementById('categoryId').value)
    };

    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/products/${productId}`, {
            method: 'PUT', //Dùng PUT để cập nhật sửa chữa
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Cập nhật sản phẩm thành công!");
            window.location.href = 'index.html';
        } else {
            alert("Cập nhật thất bại!");
        }
    } catch (error) {
        alert("Lỗi kết nối!");
    }
});