// Background audio must NOT start automatically.
// It only starts after the visitor explicitly unmutes it with the sound control.

const getYouTubeId = value => {
  try {
    const url = new URL(value, window.location.href);
    if (!/youtube\.com|youtu\.be/.test(url.hostname)) return null;
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0] || null;
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    const embedIndex = parts.indexOf("embed");
    return embedIndex >= 0 ? parts[embedIndex + 1] : null;
  } catch {
    return null;
  }
};

let youtubeFrame = null;
let youtubeId = null;
let youtubeReady = false;
let pendingCommand = null;

const sendYouTubeCommand = command => {
  if (!youtubeFrame?.contentWindow || !youtubeId) return;
  if (!youtubeReady) {
    pendingCommand = command;
    return;
  }
  youtubeFrame.contentWindow.postMessage(JSON.stringify({
    event: "command",
    func: command,
    args: []
  }), "https://www.youtube.com");
};

const setupYouTubeAudio = audio => {
  const id = getYouTubeId(audio?.src || audio?.getAttribute("src") || "");
  if (!id) return false;

  if (youtubeId === id && youtubeFrame) return true;

  youtubeId = id;
  youtubeReady = false;
  pendingCommand = null;
  youtubeFrame?.remove();

  youtubeFrame = document.createElement("iframe");
  youtubeFrame.title = "Background worship audio";
  youtubeFrame.setAttribute("aria-hidden", "true");
  youtubeFrame.setAttribute("tabindex", "-1");
  youtubeFrame.allow = "autoplay; encrypted-media";
  youtubeFrame.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;border:0;left:-10px;bottom:-10px;";
  youtubeFrame.addEventListener("load", () => {
    youtubeReady = true;
    if (pendingCommand) {
      const command = pendingCommand;
      pendingCommand = null;
      sendYouTubeCommand(command);
    }
  }, { once: true });
  youtubeFrame.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?enablejsapi=1&autoplay=0&controls=0&loop=1&playlist=${encodeURIComponent(id)}&playsinline=1&rel=0`;
  document.body.appendChild(youtubeFrame);

  if (!audio.__youtubeAudioPatched) {
    const nativePlay = audio.play.bind(audio);
    const nativePause = audio.pause.bind(audio);
    audio.play = () => {
      if (getYouTubeId(audio.src || audio.getAttribute("src") || "")) {
        sendYouTubeCommand("playVideo");
        return Promise.resolve();
      }
      return nativePlay();
    };
    audio.pause = () => {
      if (getYouTubeId(audio.src || audio.getAttribute("src") || "")) {
        sendYouTubeCommand("pauseVideo");
        return;
      }
      nativePause();
    };
    audio.__youtubeAudioPatched = true;
  }

  return true;
};

const hideSoundAfterEnter = () => {
  const style = document.createElement("style");
  style.textContent = ".page.entered .sound{display:none!important}";
  document.head.appendChild(style);
};

const observeAudio = () => {
  const audio = document.querySelector("audio[aria-hidden='true']");
  if (!audio) return;

  setupYouTubeAudio(audio);
  hideSoundAfterEnter();

  new MutationObserver(() => setupYouTubeAudio(audio)).observe(audio, {
    attributes: true,
    attributeFilter: ["src"]
  });
};

document.addEventListener("click", event => {
  const enterButton = event.target.closest?.(".enter");
  if (enterButton) return;

  const soundButton = event.target.closest?.(".sound");
  if (!soundButton) return;

  const audio = document.querySelector("audio[aria-hidden='true']");
  if (!audio || !setupYouTubeAudio(audio)) return;

  // The click starts with the audio muted. Therefore this explicit user
  // gesture means UNMUTE -> play. A second click starts muted -> pause.
  const wasMuted = audio.muted;
  if (wasMuted) sendYouTubeCommand("playVideo");
  else sendYouTubeCommand("pauseVideo");
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", observeAudio, { once: true });
} else {
  observeAudio();
}
