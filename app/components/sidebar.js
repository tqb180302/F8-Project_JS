const pageTitles = [
    {
        title: "Tổng quan",
        icon: `<i class="fas fa-home"></i>`,
        path: "/app/dashboard/index.html",
    },
    {
        title: "Sản phẩm",
        icon: `<i class="fas fa-box"></i>`,
        path: "/app/products/index.html",
    },
    {
        title: "Đơn hàng",
        icon: `<i class="fas fa-shopping-bag"></i>`,
        path: "/app/orders/index.html",
    },
    {
        title: "Khách hàng",
        icon: `<i class="fas fa-users"></i>`,
        path: "/app/customers/index.html",
    },
    {
        title: "Báo cáo",
        icon: `<i class="fas fa-chart-line"></i>`,
        path: "/app/reports/index.html",
    },
];

export function sidebar() {

    const currentPath = window.location.pathname;
    const base = currentPath.split('/app/')[0];

    return `
        <h2 class="">ShopAdmin</h2>
        <ul>
            ${pageTitles.map((item) => {
        const isActive = currentPath.includes(item.path);

        return `
                    <li class="${isActive ? "active" : ""}">
                        <a href="${base}${item.path}" data-link>
                            <span class="">${item.icon}</span>
                            ${item.title}
                        </a>
                    </li>
                `;
    }).join("")}
        </ul>
    `;
}