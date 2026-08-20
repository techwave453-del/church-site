// Background audio must NOT start automatically.
// It only starts after the visitor explicitly unmutes it with the sound control.
document.addEventListener("click", event => {
  const enterButton = event.target.closest?.(".enter");
  if (!enterButton) return;

  // The audio control is handled by BackgroundAudio in main.jsx.
  // Do not call play() here: entering the site must remain silent.
});
