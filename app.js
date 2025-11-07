document.addEventListener('DOMContentLoaded', () => {
  // Popup logic: click card to open overlay
  const popupCards = document.querySelectorAll('.popup-trigger');

  popupCards.forEach(card => {
    const overlayId = card.getAttribute('data-overlay');
    const overlay = document.getElementById(overlayId);
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


document.addEventListener('DOMContentLoaded', () => {
  const usernameText = document.getElementById('username');
  const overlay = document.getElementById('usernameOverlay');
  const closeBtn = overlay.querySelector('.closePopup');
  const saveBtn = document.getElementById('saveUsername');
  const input = document.getElementById('usernameInput');

  usernameText.addEventListener('click', () => {
    input.value = usernameText.textContent;
    overlay.classList.add('active');
    overlay.querySelector('.popup-card').classList.add('expanded');
    document.body.style.overflow = 'hidden';
  });

  const closeOverlay = () => {
    overlay.classList.remove('active');
    overlay.querySelector('.popup-card').classList.remove('expanded');
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  saveBtn.addEventListener('click', () => {
    usernameText.textContent = input.value;
    closeOverlay();
  });
});