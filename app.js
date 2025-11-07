document.addEventListener('DOMContentLoaded', () => {
  // Popup logic: click card to open overlay
  const popupCards = document.querySelectorAll('.popup-trigger');

  popupCards.forEach(card => {
    const overlayId = card.getAttribute('data-overlay');
    const overlay = document.getElementById(overlayId);
    const popupCard = overlay.querySelector('.popup-card');
    const closeBtn = overlay.querySelector('.closePopup');

    const openOverlay = () => {
      overlay.classList.add('active');
      popupCard.classList.add('expanded');
      document.body.style.overflow = 'hidden';
    };
    const closeOverlay = () => {
      overlay.classList.remove('active');
      popupCard.classList.remove('expanded');
      document.body.style.overflow = '';
    };

    card.addEventListener('click', openOverlay);
    closeBtn.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', e => {
      if(e.target === overlay) closeOverlay();
    });
  });

  // Current Power Chart using Chart.js
  const ctx = document.getElementById('currentPowerGraph');
  if(ctx){
    new Chart(ctx, {
      type:'bar',
      data:{
        labels:['3 Nov','9 Nov'],
        datasets:[{
          label:'kW',
          data:[2.74, 2.74],
          backgroundColor:['var(--color-accent-solar)','var(--color-accent-grid)']
        }]
      },
      options:{
        responsive:true,
        plugins:{legend:{display:false}},
        scales:{y:{beginAtZero:true}}
      }
    });
  }
});
