import { Chart, type ChartItem } from "chart.js";

const createBarChart = (chartCanvas: HTMLElement, labelName: string, labelList: string[], valueList: number[]) => {

    new Chart(chartCanvas as ChartItem, {
        type: "bar",
        data: {
            labels: labelList,
            datasets: [{
                label: labelName,
                data: valueList,
                borderWidth: 1,
            }],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                }
            }
        }
    });
}

export {
    createBarChart
}
