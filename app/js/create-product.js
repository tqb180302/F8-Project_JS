import { sidebar } from '../components/sidebar.js';
document.getElementById('sidebar-container').innerHTML = sidebar();


async function loadCategories() {
    try {
        const token = localStorage.getItem('accessToken');
        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const categoryList = Array.isArray(data) ? data : (data.data || []);

            const selectElement = document.getElementById('categoryId');


            selectElement.innerHTML = '';

            categoryList.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                selectElement.appendChild(option);
            });

        }
    } catch (error) {
        console.error("Lỗi khi kéo danh mục:", error);
    }
}

loadCategories();


const form = document.getElementById('productForm');
if (form) {
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
            const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Thêm sản phẩm thành công rực rỡ!");
                window.location.href = 'index.html';
            } else {
                const errorData = await response.json();
                alert("Lỗi từ server: " + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error("Lỗi mạng:", error);
            alert("Không thể kết nối đến máy chủ!");
        }
    });
}