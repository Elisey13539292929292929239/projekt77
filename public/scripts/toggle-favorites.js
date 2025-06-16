document.querySelectorAll('.favorite-icon').forEach(icon => {
  icon.addEventListener('click', async () => {
    const idAnime = icon.getAttribute('data-idAnime');

    try {
      const res = await fetch('/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idAnime })
      });

      const data = await res.json();

      if (res.ok) {
        icon.classList.toggle('selected');
      } else {
        alert(data.error || 'Error updating favorites');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating favorites');
    }
  });
});
