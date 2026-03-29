const pageTitles = [
    {
        title: "Tổng quan",
        icon: `<i class="fas fa-home"></i>`,
        path: "/index.html",
    },
    {
        title: "Sản phẩm",
        icon: `<i class="fas fa-box"></i>`,
        path: "/products/index.html",
    },
    {
        title: "Đơn hàng",
        icon: `<i class="fas fa-shopping-bag"></i>`,
        path: "/orders/index.html",
    },
    {
        title: "Khách hàng",
        icon: `<i class="fas fa-users"></i>`,
        path: "/customers/index.html",
    },
    {
        title: "Báo cáo",
        icon: `<i class="fas fa-chart-line"></i>`,
        path: "/reports/index.html",
    },
];

export function sidebar() {

    const currentPath = window.location.pathname;

    return `
        <h2 class="">ShopAdmin</h2>
        <ul>
            ${pageTitles.map((item) => {
        const isActive = currentPath.includes(item.path);

        return `
                    <li class="${isActive ? "active" : ""}">
                        <a href="..${item.path}" data-link>
                            <span class="">${item.icon}</span>
                            ${item.title}
                        </a>
                    </li>
                `;
    }).join("")}
        </ul>
    `;
}