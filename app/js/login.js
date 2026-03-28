
const formDangNhap = document.getElementById('login-form');

formDangNhap.addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailDienVao = document.getElementById('email').value;
    const matKhauDienVao = document.getElementById('password').value;

    console.log("1. Đang gửi dữ liệu lên Server...");

    try {
        const response = await fetch('https://k305jhbh09.execute-api.ap-southeast-1.amazonaws.com/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailDienVao,
                password: matKhauDienVao
            })
        });

        const data = await response.json();


        if (response.ok) {
            localStorage.setItem('accessToken', data['token'])
            window.location.href = 'index.html';
        } else {

            alert("Đăng nhập thất bại: " + data.message);
            console.log("Lỗi từ server:", data);
        }
    } catch (error) {
        console.log("Lỗi mạng không gọi được API:", error);
    }
});