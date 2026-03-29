export function commonTable(container, columns, dataSource) {
    const parent = typeof container === "string" ? document.querySelector(container) : container;
    if (!parent) return;

    const table = document.createElement("table");
    table.className = "common-table";

    // Vẽ Thead
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    columns.forEach((col) => {
        const th = document.createElement("th");
        th.textContent = col.title || "";
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);


    const tbody = document.createElement("tbody");
    dataSource.forEach((row) => {
        const tr = document.createElement("tr");
        columns.forEach((col) => {
            const td = document.createElement("td");
            if (col.render && typeof col.render === "function") {
                const result = col.render(row[col.dataIndex], row);
                if (result instanceof Node) {
                    td.appendChild(result);
                } else {
                    td.innerHTML = result || "";
                }
            } else {
                td.textContent = row[col.dataIndex] ?? "";
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    parent.innerHTML = "";
    parent.appendChild(table);
}