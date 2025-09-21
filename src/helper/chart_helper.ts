import { Chart, type ChartItem } from "chart.js";

const createBarChart = (chartCanvas: HTMLElement, labelList: string[], labelName: string, valueList: number[]) => {

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
                    ticks: {
                        stepSize: 1
                    },
                },
                x: {
                    stacked: true,
                }
            },
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: {
                    display: false,
                }
            }

        }
    });
}

export {
    createBarChart
}
