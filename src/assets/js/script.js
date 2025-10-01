  const track = document.querySelector('.carousel-track');
  const leftBtn = document.querySelector('.left-btn');
  const rightBtn = document.querySelector('.right-btn');

  const scrollAmount = 240; // card width + margin

  leftBtn.addEventListener('click', () => {
    track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });

  rightBtn.addEventListener('click', () => {
    track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });
//----------------------------------------------------------------------------------
  const filters = document.querySelectorAll('.filter');
  const propertyGroups = document.querySelectorAll('.property-group');

  filters.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Hide all property groups
      propertyGroups.forEach(group => {
        group.style.display = 'none';
      });

      // Show selected group
      const selectedCategory = btn.textContent.trim().toLowerCase();
      let key = 'villa'; // default
      if (selectedCategory.includes('flat')) key = 'flat';
      else if (selectedCategory.includes('plot')) key = 'plot';
      else if (selectedCategory.includes('pg')) key = 'pg';

      const groupToShow = document.querySelector(`.property-group[data-category="${key}"]`);
      if (groupToShow) groupToShow.style.display = 'flex';
    });
  });

