// app.js

// Dummy data for all charts and progress metrics.
// To plug in real sensor data later, replace these values with live readings.
const sensorData = {
  today: {
    labels: [
      "00:00",
      "02:00",
      "04:00",
      "06:00",
      "08:00",
      "10:00",
      "12:00",
      "14:00",
      "16:00",
      "18:00",
      "20:00",
      "22:00"
    ],
    values: [0.1, 0.15, 0.2, 0.45, 0.9, 1.3, 1.7, 2.0, 2.6, 3.1, 3.7, 4.0]
  },
  weekly: {
    labels: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    values: [520, 580, 600, 720, 650, 700, 640],
    bestDay: "Thursday",
    average: 630,
    changeVsLastWeek: 15
  },
  achievements: {
    steps: { value: 8000, goal: 10000 },
    energy: { value: 7500, goal: 10000 },
    money: { value: 7000, goal: 10000 },
    co2: { value: 3000, goal: 10000 }
  },
  energyPerStep: {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    values: [24, 26, 28, 30, 31, 29, 30],
    current: 30
  },
  storedVsUsed: {
    stored: 350,
    used: 250,
    storedChange: 30,
    usedChange: 25,
    recentStored: {
      labels: ["-24h", "-20h", "-16h", "-12h", "-8h", "-4h", "Now"],
      values: [210, 230, 250, 270, 290, 310, 350]
    }
  }
};

// Chart instances
const charts = {
  todayPower: null,
  weeklyPreview: null,
  weeklyDetail: null,
  achievements: null,
  energyPerStep: null,
  storedVsUsedDoughnut: null,
  storedVsUsedLine: null
};

/**
 * Create line chart for today's power generation.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{labels: string[], values: number[]}} data
 */
function createTodayPowerChart(ctx, data) {
  charts.todayPower = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Power (kWh)",
          data: data.values,
          borderColor: "rgba(39, 174, 96, 1)",
          backgroundColor: "rgba(39, 174, 96, 0.18)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: "rgba(39, 174, 96, 1)"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          intersect: false,
          mode: "index"
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.06)" }
        }
      }
    }
  });
}

/**
 * Create weekly average charts (preview and detailed).
 * @param {CanvasRenderingContext2D} detailCtx
 * @param {{labels: string[], values: number[], bestDay: string, average: number, changeVsLastWeek: number}} data
 */
function createWeeklyAverageChart(detailCtx, data) {
  const incValues = [];
  const decValues = [];

  for (let i = 0; i < data.values.length; i++) {
    const current = data.values[i];
    const prev = i === 0 ? null : data.values[i - 1];

    if (prev === null || current >= prev) {
      incValues.push(current);
      decValues.push(null);
    } else {
      incValues.push(null);
      decValues.push(current);
    }
  }

  // Detailed chart
  charts.weeklyDetail = new Chart(detailCtx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Increase",
          data: incValues,
          borderColor: "rgba(46, 204, 113, 1)",
          backgroundColor: "rgba(46, 204, 113, 0.12)",
          tension: 0.4,
          spanGaps: true,
          pointRadius: 4,
          pointBackgroundColor: "rgba(46, 204, 113, 1)"
        },
        {
          label: "Decrease",
          data: decValues,
          borderColor: "rgba(231, 76, 60, 1)",
          backgroundColor: "rgba(231, 76, 60, 0.12)",
          tension: 0.4,
          spanGaps: true,
          pointRadius: 4,
          pointBackgroundColor: "rgba(231, 76, 60, 1)"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          intersect: false,
          mode: "index"
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: false,
          grid: { color: "rgba(0,0,0,0.06)" }
        }
      }
    }
  });

  // Preview chart
  const previewCanvas = document.getElementById("weeklyAveragePreview");
  if (previewCanvas) {
    const previewCtx = previewCanvas.getContext("2d");
    charts.weeklyPreview = new Chart(previewCtx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Weekly average",
            data: data.values,
            borderColor: "rgba(255, 107, 0, 1)",
            backgroundColor: "rgba(255, 107, 0, 0.22)",
            tension: 0.4,
            fill: true,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 800,
          easing: "easeOutQuart"
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  // Text stats
  const bestDayEl = document.getElementById("weeklyBestDay");
  const avgEl = document.getElementById("weeklyAverageValue");
  const changeEl = document.getElementById("weeklyChange");

  if (bestDayEl) bestDayEl.textContent = data.bestDay;
  if (avgEl) avgEl.textContent = `${data.average} kWh`;
  if (changeEl) {
    const prefix = data.changeVsLastWeek >= 0 ? "+" : "";
    changeEl.textContent = `${prefix}${data.changeVsLastWeek}%`;
  }
}

/**
 * Create achievements bar chart.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{steps:{value:number,goal:number},energy:{value:number,goal:number},money:{value:number,goal:number},co2:{value:number,goal:number}}} data
 */
function createAchievementChart(ctx, data) {
  const labels = ["Steps", "Energy", "Money", "CO₂"];
  const values = [
    (data.steps.value / data.steps.goal) * 100,
    (data.energy.value / data.energy.goal) * 100,
    (data.money.value / data.money.goal) * 100,
    (data.co2.value / data.co2.goal) * 100
  ];

  charts.achievements = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Progress (%)",
          data: values,
          backgroundColor: [
            "rgba(255, 107, 0, 0.9)",
            "rgba(255, 107, 0, 0.9)",
            "rgba(0, 170, 255, 0.9)",
            "rgba(39, 174, 96, 0.9)"
          ],
          borderRadius: 8,
          maxBarThickness: 42
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              return `${context.parsed.y.toFixed(0)}% of goal`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: { color: "rgba(0,0,0,0.06)" }
        }
      }
    }
  });
}

/**
 * Create energy per step line chart.
 * @param {CanvasRenderingContext2D} ctx
 * @param {{labels:string[], values:number[]}} data
 */
function createEnergyPerStepChart(ctx, data) {
  charts.energyPerStep = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Wh per step",
          data: data.values,
          borderColor: "rgba(0, 170, 255, 1)",
          backgroundColor: "rgba(0, 170, 255, 0.18)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: "rgba(0, 170, 255, 1)"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          intersect: false,
          mode: "index"
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: false,
          grid: { color: "rgba(0,0,0,0.06)" }
        }
      }
    }
  });
}

/**
 * Create stored vs used doughnut + stored energy line chart.
 * @param {CanvasRenderingContext2D} ctxDoughnut
 * @param {CanvasRenderingContext2D} ctxLine
 * @param {{stored:number, used:number, recentStored:{labels:string[], values:number[]}}} data
 */
function createStoredVsUsedCharts(ctxDoughnut, ctxLine, data) {
  charts.storedVsUsedDoughnut = new Chart(ctxDoughnut, {
    type: "doughnut",
    data: {
      labels: ["Stored", "Used"],
      datasets: [
        {
          data: [data.stored, data.used],
          backgroundColor: [
            "rgba(46, 204, 113, 0.9)",
            "rgba(231, 76, 60, 0.9)"
          ],
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            boxWidth: 14
          }
        }
      }
    }
  });

  charts.storedVsUsedLine = new Chart(ctxLine, {
    type: "line",
    data: {
      labels: data.recentStored.labels,
      datasets: [
        {
          label: "Stored energy (kWh)",
          data: data.recentStored.values,
          borderColor: "rgba(255, 107, 0, 1)",
          backgroundColor: "rgba(255, 107, 0, 0.18)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointBackgroundColor: "rgba(255, 107, 0, 1)"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart"
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          intersect: false,
          mode: "index"
        }
      },
      scales: {
        x: {
          grid: { display: false }
        },
        y: {
          beginAtZero: false,
          grid: { color: "rgba(0,0,0,0.06)" }
        }
      }
    }
  });
}

/**
 * Initialize interactions:
 * - card click => expand + overlay
 * - close button / overlay click => collapse
 * - only create charts once per card
 */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".card");
  const overlay = document.querySelector(".overlay");
  let expandedCard = null;

  // Initialize progress bar widths from dummy data
  const progressMap = sensorData.achievements;
  document.querySelectorAll(".progress-fill").forEach((fill) => {
    const key = fill.dataset.progressKey;
    if (!key || !progressMap[key]) return;
    const metric = progressMap[key];
    const percentage = (metric.value / metric.goal) * 100;
    fill.style.width = `${Math.min(percentage, 100)}%`;
  });

  function expandCard(card) {
    if (expandedCard === card) return;

    if (expandedCard) {
      collapseCard(expandedCard);
    }

    overlay.classList.add("overlay--visible");
    card.classList.add("card--expanded");
    expandedCard = card;

    const type = card.dataset.cardType;

    switch (type) {
      case "todayPower": {
        if (!charts.todayPower) {
          const canvas = card.querySelector("#todayPowerChart");
          if (canvas) {
            createTodayPowerChart(canvas.getContext("2d"), sensorData.today);
          }
        }
        break;
      }
      case "weeklyAverage": {
        if (!charts.weeklyDetail) {
          const detailCanvas = card.querySelector("#weeklyAverageDetail");
          if (detailCanvas) {
            createWeeklyAverageChart(
              detailCanvas.getContext("2d"),
              sensorData.weekly
            );
          }
        }
        break;
      }
      case "achievements": {
        if (!charts.achievements) {
          const canvas = card.querySelector("#achievementChart");
          if (canvas) {
            createAchievementChart(
              canvas.getContext("2d"),
              sensorData.achievements
            );
          }
        }
        break;
      }
      case "energyPerStep": {
        if (!charts.energyPerStep) {
          const canvas = card.querySelector("#energyPerStepChart");
          if (canvas) {
            createEnergyPerStepChart(
              canvas.getContext("2d"),
              sensorData.energyPerStep
            );
          }
        }
        break;
      }
      case "storedUsed": {
        if (!charts.storedVsUsedDoughnut || !charts.storedVsUsedLine) {
          const doughnutCanvas = card.querySelector("#storedUsedDoughnut");
          const lineCanvas = card.querySelector("#storedUsedLine");
          if (doughnutCanvas && lineCanvas) {
            createStoredVsUsedCharts(
              doughnutCanvas.getContext("2d"),
              lineCanvas.getContext("2d"),
              sensorData.storedVsUsed
            );
          }
        }
        break;
      }
      default:
        break;
    }
  }

  function collapseCard(card) {
    card.classList.remove("card--expanded");
    overlay.classList.remove("overlay--visible");
    expandedCard = null;
  }

  // Card click => expand
  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      // Ignore clicks on the close button (handled separately)
      if (event.target.closest(".card-close")) return;

      if (card.classList.contains("card--expanded")) return;

      expandCard(card);
    });

    const closeButton = card.querySelector(".card-close");
    if (closeButton) {
      closeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        collapseCard(card);
      });
    }
  });

  // Overlay click => collapse
  overlay.addEventListener("click", () => {
    if (expandedCard) {
      collapseCard(expandedCard);
    }
  });
});