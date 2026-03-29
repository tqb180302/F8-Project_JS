const summaryListFake = [
    {
        cardColor: "blue",
        title: "Doanh Thu",
        value: 20,
        valueColor: null,
    },
    {
        cardColor: "red",
        title: "Lợi nhuận",
        value: "1 triệu",
        valueColor: "red",
        trend: {
            trendValue: '10%',
            isTrendUp: true,
        }
    }
];

export function createSummary(summaryList = summaryListFake) {
    const sumarySection = document.createElement('section');
    sumarySection.classList.add('stats'); // Class tổng

    summaryList.forEach(summaryItem => {
        const card = document.createElement('div');
        card.classList.add('card');
        if (summaryItem.cardColor) card.classList.add(summaryItem.cardColor);

        const title = document.createElement('h3');
        title.innerText = summaryItem.title;

        const value = document.createElement('p');
        value.innerText = summaryItem.value;
        if (summaryItem.valueColor) value.classList.add(summaryItem.valueColor);

        card.append(title, value);

        if (summaryItem.trend) {
            const trend = document.createElement('div');
            trend.classList.add('trend');

            const icon = document.createElement('i');
            icon.classList.add('fas');

            if (summaryItem.trend.isTrendUp) {
                trend.classList.add('up');
                icon.classList.add('fa-arrow-up');
            } else {
                trend.classList.add('down');
                icon.classList.add('fa-arrow-down');
            }

            const trenValue = document.createElement('span');
            trenValue.innerText = summaryItem.trend.trendValue;

            trend.append(icon, trenValue);
            card.appendChild(trend);
        }

        sumarySection.appendChild(card);
    });

    return sumarySection;
}