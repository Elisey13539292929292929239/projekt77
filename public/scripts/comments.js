document.getElementById('comment-form').addEventListener('submit', async e => {
  e.preventDefault();

  const form     = e.target;
  const comment  = form.comment.value.trim();
  const rating   = form.rating.value || null;
  const idAnime  = form.idAnime.value;

  try {
    const res = await fetch('/anime-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', 
      body: JSON.stringify({ idAnime, comment, rating })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);

    location.reload();
  } catch (err) {
    alert('Ошибка: ' + err.message);
    console.error(err);
  }
});
