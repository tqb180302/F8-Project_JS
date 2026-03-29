const formDangNhap = document.getElementById('login-form');

formDangNhap.addEventListener('submit', async function(event) {
    event.preventDefault();

    const emailDienVao = document.getElementById('email').value;
    const matKhauDienVao = document.getElementById('password').value;


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

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            window.location.href = 'index.html';
        } else {
            alert("Đăng nhập thất bại: Vui lòng kiểm tra lại Email hoặc Mật khẩu!");
        }

    } catch (error) {
        console.log("Lỗi mạng không gọi được API:", error);
        alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau!");
    }
});