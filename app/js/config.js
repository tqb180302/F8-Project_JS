const API_DOMAIN = "https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com";

async function request(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('accessToken');

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_DOMAIN}/${endpoint}`, options);

        if (response.status === 401) {
            alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            localStorage.removeItem('accessToken');
            window.location.href = '../login.html';
            return null;
        }

        if (!response.ok) {
            console.error(`Lỗi API (${method} ${endpoint}):`, response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Lỗi mạng:", error);
        return null;
    }
}

const api = {
    get: (endpoint) => request(endpoint, 'GET'),
    post: (endpoint, data) => request(endpoint, 'POST', data),
    put: (endpoint, data) => request(endpoint, 'PUT', data),
    delete: (endpoint) => request(endpoint, 'DELETE')
};