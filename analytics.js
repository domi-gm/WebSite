// analytics.js - initializes Chart.js charts for Analytics page
document.addEventListener('DOMContentLoaded', function(){
  // Read analytics palette from CSS variables (keeps colors centralized)
  const rootStyles = getComputedStyle(document.documentElement);
  const ACCENT_GREEN = (rootStyles.getPropertyValue('--analytics-accent-green') || '#16a085').trim();
  const ACCENT_ORANGE = (rootStyles.getPropertyValue('--analytics-accent-orange') || '#ff8a3d').trim();
  const ACCENT_BLUE = (rootStyles.getPropertyValue('--analytics-accent-blue') || '#2b6cb0').trim();
  const MUTED = (rootStyles.getPropertyValue('--analytics-muted') || '#93a4b8').trim();

  // --- Doughnut: Energy Yield ---
  const yieldCtx = document.getElementById('energyYieldChart');
  if(yieldCtx){
    const yieldLabels = ['Energie Stocată','Trimisă în Grid','Pierderi Sistem'];
    const yieldData = [35,50,15];
  const yieldColors = [ACCENT_GREEN, ACCENT_ORANGE, '#6b7280'];

    const energyYieldChart = new Chart(yieldCtx, {
      type: 'doughnut',
      data: {
        labels: yieldLabels,
        datasets: [{
          data: yieldData,
          backgroundColor: yieldColors,
          borderWidth: 0
        }]
      },
      options: {
        responsive:true,
        maintainAspectRatio:false,
        cutout: '70%',
        plugins:{
          legend:{display:false},
          tooltip:{
            callbacks:{
              label: function(ctx){
                const v = ctx.parsed;
                const label = ctx.label || '';
                return label + ': ' + v + '%';
              }
            }
          }
        }
      }
    });

    // custom legend
    createLegend('yieldLegend', yieldLabels, yieldColors);
  }

  // --- Doughnut: Energy Consumption ---
  const consCtx = document.getElementById('energyConsumptionChart');
  if(consCtx){
    const consLabels = ['Auto-suficiență','Din Grid','Excedent Export'];
    const consData = [60,30,10];
  const consColors = [ACCENT_GREEN, '#6b7280', ACCENT_ORANGE];

    const energyConsumptionChart = new Chart(consCtx, {
      type:'doughnut',
      data:{
        labels:consLabels,
        datasets:[{
          data:consData,
          backgroundColor:consColors,
          borderWidth:0
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        cutout:'70%',
        plugins:{
          legend:{display:false},
          tooltip:{
            callbacks:{
              label:function(ctx){
                const v = ctx.parsed;
                const label = ctx.label || '';
                return label + ': ' + v + '%';
              }
            }
          }
        }
      }
    });

    createLegend('consumptionLegend', consLabels, consColors);
  }

  // --- Bar chart: Tendințe Energie: Generare vs Consum ---
  const trendsCtx = document.getElementById('energyTrendsChart');
  if(trendsCtx){
    const days = ['Lun','Mar','Mie','Joi','Vin','Sâm','Dum'];
    // sample weekly data
    const generated = [320, 410, 380, 460, 540, 490, 600];
    const consumed =  [300, 380, 350, 420, 500, 450, 520];

    const trendsChart = new Chart(trendsCtx, {
      type:'bar',
      data:{
        labels:days,
        datasets:[
          {
            label:'Energie Generată',
            data:generated,
            backgroundColor: ACCENT_GREEN,
            borderRadius:6,
            barPercentage:0.66,
            categoryPercentage:0.66
          },
          {
            label:'Energie Consumată',
            data:consumed,
            backgroundColor: ACCENT_ORANGE,
            borderRadius:6,
            barPercentage:0.66,
            categoryPercentage:0.66
          }
        ]
      },
      options:{
        responsive:true,
        maintainAspectRatio:false,
        plugins:{
          legend:{
            display:true,
            position:'top',
            labels:{color: MUTED}
          },
          tooltip:{
            callbacks:{
              label:function(ctx){
                const val = ctx.parsed.y;
                return ctx.dataset.label + ': ' + val + ' kWh';
              }
            }
          }
        },
        scales:{
          x:{
            grid:{display:false, drawBorder:false},
            ticks:{color:MUTED}
          },
          y:{
            beginAtZero:true,
            grid:{color:'rgba(255,255,255,0.04)'},
            ticks:{color:MUTED}
          }
        }
      }
    });
  }

  // helper to create a simple legend
  function createLegend(containerId, labels, colors){
    const container = document.getElementById(containerId);
    if(!container) return;
    container.innerHTML = '';
    labels.forEach((lab, i) => {
      const item = document.createElement('div');
      item.className = 'legend-item';

      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.backgroundColor = colors[i] || '#fff';

      const lbl = document.createElement('span');
      lbl.className = 'legend-label';
      lbl.textContent = lab;

      item.appendChild(sw);
      item.appendChild(lbl);
      container.appendChild(item);
    });
  }

});
