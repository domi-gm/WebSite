  document.addEventListener('DOMContentLoaded', () => {
      // Popup logic: click card to open overlay
      const popupCards = document.querySelectorAll('.popup-trigger');
  
      popupCards.forEach(card => {
        const overlayId = card.getAttribute('data-overlay');
        const overlay = document.getElementById(overlayId);
        if (!overlay) return;
        const popupCard = overlay.querySelector('.popup-card');
        const closeBtn = overlay.querySelector('.closePopup');
  
        let lastCardRect = null;
  
        const openOverlay = () => {
          lastCardRect = card.getBoundingClientRect();
  
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
  
          popupCard.style.top = `${lastCardRect.top}px`;
          popupCard.style.left = `${lastCardRect.left}px`;
          popupCard.style.width = `${lastCardRect.width}px`;
          popupCard.style.height = `${lastCardRect.height}px`;
  
          card.classList.add('selected');
  
          requestAnimationFrame(() => {
            popupCard.classList.add('expanded');
            const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
            const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
            const targetWidth = Math.min(720, vw * 0.8);
            const targetHeight = vh * 0.8;
  
  
            popupCard.style.top = `${(vh - targetHeight) / 2}px`;
            popupCard.style.left = `${(vw - targetWidth) / 2}px`;
            popupCard.style.width = `${targetWidth}px`;
            popupCard.style.height = `${targetHeight}px`;
          });
        };
  
        const closeOverlay = () => {
          if (!lastCardRect) return;
  
          popupCard.classList.remove('expanded');
  
          popupCard.style.top = `${lastCardRect.top}px`;
          popupCard.style.left = `${lastCardRect.left}px`;
          popupCard.style.width = `${lastCardRect.width}px`;
          popupCard.style.height = `${lastCardRect.height}px`;
  
          const onTransitionEnd = () => {
            overlay.classList.remove('active');
            card.classList.remove('selected');
            document.body.style.overflow = '';
            popupCard.removeEventListener('transitionend', onTransitionEnd);
          };
          popupCard.addEventListener('transitionend', onTransitionEnd);
        };
  
        card.addEventListener('click', openOverlay);
        if (closeBtn) closeBtn.addEventListener('click', closeOverlay);
        overlay.addEventListener('click', e => {
          if (e.target === overlay) closeOverlay();
        });
      });
  
      // Current Power Chart using Chart.js
      const ctx = document.getElementById('currentPowerGraph');
      if (ctx) {
        new Chart(ctx, {
          type: 'bar',
          data: {
            labels: ['3 Nov', '9 Nov'],
            datasets: [{
              label: 'kW',
              data: [2.74, 2.74],
              backgroundColor: ['var(--color-accent-solar)', 'var(--color-accent-grid)']
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false } },
              y: { beginAtZero: true, grid: { display: false } }
            }
          }
        });
      }
  
      // Panel image zoom + annotation lines
      const panelImg = document.querySelector('.panel-img');
      const lines = document.querySelectorAll('.annotation-line');
      const maxZoomScroll = 300;
  
      if (panelImg && lines.length > 0) {
        window.addEventListener('scroll', () => {
          const scrollY = Math.min(window.scrollY, maxZoomScroll);
          const progress = scrollY / maxZoomScroll;
  
          // Zoom out image smoothly
          panelImg.style.transform = `scale(${1 - 0.4 * progress})`;
  
          // Show lines progressively
          lines.forEach((line, index) => {
            const threshold = 0.2 + index * 0.2;
            if (progress > threshold) {
              line.classList.add('visible');
            } else {
              line.classList.remove('visible');
            }
          });
        });
      }
  
      // Additional charts (if present on the page)
      const powerTodayCtx = document.getElementById('powerTodayChart');
      if (powerTodayCtx) {
        new Chart(powerTodayCtx, {
          type: 'line',
          data: {
            labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00'],
            datasets: [{
              label: 'Power (kWh)',
              data: [0, 0, 0, 0, 0.1, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4],
              borderColor: 'var(--color-accent-solar)',
              tension: 0.4,
              fill: true
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
  
      const weeklyAverageCtx = document.getElementById('weeklyAverageChart');
      if (weeklyAverageCtx) {
        new Chart(weeklyAverageCtx, {
          type: 'line',
          data: {
            labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
            datasets: [{
              label: 'kWh',
              data: [3, 4, 3.5, 5, 4.5, 6, 5.5],
              borderColor: 'var(--color-accent-grid)'
            }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { display: false } } } }
        });
      }
  
      const weeklyAverageDetailCtx = document.getElementById('weeklyAverageDetailChart');
      if (weeklyAverageDetailCtx) {
        new Chart(weeklyAverageDetailCtx, {
          type: 'line',
          data: {
            labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
            datasets: [{ label: 'kWh', data: [3, 4, 3.5, 5, 4.5, 6, 5.5], borderColor: 'var(--color-accent-grid)', tension: 0.4, fill: true }]
          },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
  
      const achievementsBarCtx = document.getElementById('achievementsBarChart');
      if (achievementsBarCtx) {
        new Chart(achievementsBarCtx, {
          type: 'bar',
          data: { labels: ['Steps', 'Energy', 'Money Saved', 'CO₂ Reduction'], datasets: [{ label: 'Progress', data: [80, 75, 70, 30], backgroundColor: ['#28a745', '#ffc107', '#007bff', '#6c757d'] }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
  
      const energyStepCtx = document.getElementById('energyStepChart');
      if (energyStepCtx) {
        new Chart(energyStepCtx, {
          type: 'line',
          data: { labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'], datasets: [{ label: 'Wh per step', data: [28, 29, 30, 32, 31, 30, 33], borderColor: 'var(--color-accent-solar)', tension: 0.4 }] },
          options: { responsive: true, plugins: { legend: { display: false } } }
        });
      }
  
      const storedUsedDoughnutCtx = document.getElementById('storedUsedDoughnutChart');
      if (storedUsedDoughnutCtx) {
        new Chart(storedUsedDoughnutCtx, {
          type: 'doughnut',
          data: { labels: ['Stored', 'Used'], datasets: [{ data: [350, 250], backgroundColor: ['#28a745', '#ffc107'] }] },
          options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
        });
      }
  
      const storedEnergyLineCtx = document.getElementById('storedEnergyLineChart');
          if (storedEnergyLineCtx) {
            new Chart(storedEnergyLineCtx, {
              type: 'line',
              data: { labels: ['-24h', '-20h', '-16h', '-12h', '-8h', '-4h', 'Now'], datasets: [{ label: 'Stored Energy (kWh)', data: [300, 310, 320, 310, 330, 340, 350], borderColor: '#28a745', tension: 0.4, fill: true }] },
              options: { responsive: true, plugins: { legend: { display: false } } }
            });
          }
      
          // --- Monitoring page heatmap (Time-based animation) ---
          (function renderHeatmapPanel(){
            const tiles = Array.from(document.querySelectorAll('.heatmap-grid .heatmap-tile'));
            if (!tiles || tiles.length === 0) return;
      
            const timeSlider = document.getElementById('heatmapTimeSlider');
            const timeLabel = document.getElementById('heatmapCurrentTime');
            const playPauseBtn = document.getElementById('heatmapPlayPause');
      
            if (!timeSlider || !timeLabel || !playPauseBtn) {
              console.error('Heatmap time control elements not found!');
              return;
            }
      
            // 1. Data Model: 24 hours, 64 tiles per hour (0-100)
            const heatmapDayData = Array.from({ length: 24 }, () =>
              Array.from({ length: 64 }, () => Math.floor(Math.random() * 101))
            );
      
            let currentHour = 8;
            let isPlaying = false;
            let animationInterval = null;
      
            // 2. Color Interpolation Function (Monochromatic Blue)
            function getHeatmapColor(value) {
              // value is 0-100
              // Use HSL to create a smooth gradient within a single blue hue (215deg)
              // Lightness will go from 90% (very light blue) down to 40% (dark blue)
              const lightness = 90 - (value * 0.5); // 90% -> 40%
              return `hsl(215, 100%, ${lightness}%)`;
            }
      
            // 3. Function to Update UI based on the hour
            function updateHeatmap(hour) {
              currentHour = hour;
              const hourData = heatmapDayData[hour];
              if (!hourData) return;
      
              tiles.forEach((tile, idx) => {
                  const value = hourData[idx] ?? 0;
                  tile.style.backgroundColor = getHeatmapColor(value);
                  tile.dataset.value = value;
                  tile.title = `Tile ${idx + 1} @ ${String(hour).padStart(2, '0')}:00 - ${value}% usage`;
              });
      
              // Update time label and slider position
              timeLabel.textContent = `${String(hour).padStart(2, '0')}:00`;
              timeSlider.value = hour;
            }
      
            // 4. Event Listeners for controls
            timeSlider.addEventListener('input', (e) => {
              const newHour = parseInt(e.target.value, 10);
              if (newHour !== currentHour) {
                updateHeatmap(newHour);
              }
            });
      
            playPauseBtn.addEventListener('click', () => {
              isPlaying = !isPlaying;
              playPauseBtn.textContent = isPlaying ? '❚❚' : '▶';
      
              if (isPlaying) {
                  animationInterval = setInterval(() => {
                      let nextHour = (currentHour + 1) % 24;
                      updateHeatmap(nextHour);
                  }, 200); // ~0.2 second per hour
              } else {
                  clearInterval(animationInterval);
              }
            });
            
            // Add hover effect to tiles
            tiles.forEach((tile, idx) => {
              tile.addEventListener('mouseenter', () => {
                tile.style.transform = 'scale(1.08)';
                tile.style.boxShadow = '0 8px 26px rgba(0,0,0,0.45)';
              });
              tile.addEventListener('mouseleave', () => {
                tile.style.transform = '';
                tile.style.boxShadow = '';
              });
            });
      
            // 5. Initial Render
            updateHeatmap(currentHour);
      
          })();
        });
