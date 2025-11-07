document.addEventListener('DOMContentLoaded', () => {
  // Select all buttons with class 'popupbutton'
  const popupButtons = document.querySelectorAll('.popupbutton');

  // Loop through each button to set up event listeners
  popupButtons.forEach((button) => {
    const overlayId = button.getAttribute('data-overlay');
    const overlay = document.getElementById(overlayId);
    const popupCard = overlay.querySelector('.popup-card');
    const closeBtn = overlay.querySelector('.closePopup');

    // Function to open overlay
    const openOverlay = () => {
      overlay.classList.add('active');
      if (popupCard) {
        popupCard.classList.add('expanded');
      }
      document.body.style.overflow = 'hidden';
    };

    // Function to close overlay
    const closeOverlay = () => {
      overlay.classList.remove('active');
      if (popupCard) {
        popupCard.classList.remove('expanded');
      }
      document.body.style.overflow = '';
    };

    // When button is clicked, open the overlay
    button.addEventListener('click', openOverlay);

    // When close button is clicked, close the overlay
    closeBtn.addEventListener('click', closeOverlay);

    // When clicking outside the popup content, close the overlay
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
  });
});
