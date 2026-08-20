// Keep background audio silent when the visitor enters the site.
// The entry button is a user gesture, so browsers allow the muted audio to start here.
document.addEventListener("click", event => {
  const enterButton = event.target.closest?.(".enter");
  if (!enterButton) return;

  setTimeout(() => {
    const audio = document.querySelector("audio[aria-hidden='true']");
    if (audio) {
      audio.muted = true;
      audio.play().catch(() => {});
    }

    document.querySelectorAll(".sound").forEach(button => {
      button.style.display = "none";
    });
  }, 0);
});
