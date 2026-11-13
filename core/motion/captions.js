// Legendas palavra a palavra (estilo Reels). Usa window.__WORDS injetado pelo renderizador.
// Cada palavra acende no tempo da fala. Retorna um timeline GSAP para encaixar na cena.
window.buildCaptions = function (container, gsap) {
  const words = (window.__WORDS && window.__WORDS.palavras) || [];
  const tl = gsap.timeline({ paused: true });
  const spans = words.map(w => {
    const s = document.createElement('span');
    s.className = 'cap-word'; s.textContent = w.palavra + ' ';
    container.appendChild(s); return s;
  });
  words.forEach((w, i) => {
    tl.set(spans[i], { className: 'cap-word on' }, w.inicio);
    tl.set(spans[i], { className: 'cap-word done' }, w.fim);
  });
  return tl;
};
