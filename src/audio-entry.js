// Background audio must NOT start automatically.
// It starts only after the visitor explicitly clicks the sound control.

const getYouTubeId = value => {
  try {
    const url = new URL(value, window.location.href);
    if (!/youtube\.com|youtu\.be/.test(url.hostname)) return null;
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0] || null;
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    const index = parts.indexOf("embed");
    return index >= 0 ? parts[index + 1] || null : null;
  } catch {
    return null;
  }
};

let youtubeFrame = null;
let youtubeId = null;
let youtubeReady = false;
let pendingCommand = null;
let observedAudio = null;

const sendYouTubeCommand = (func, args = []) => {
  if (!youtubeFrame?.contentWindow || !youtubeId) return;
  const message = JSON.stringify({ event: "command", func, args });
  youtubeFrame.contentWindow.postMessage(message, "https://www.youtube.com");
};

const queueYouTubeCommand = (func, args = []) => {
  if (!youtubeFrame || !youtubeId) return;
  if (!youtubeReady) {
    pendingCommand = { func, args };
    return;
  }
  sendYouTubeCommand(func, args);
};

const setupYouTubeAudio = audio => {
  const id = getYouTubeId(audio?.src || audio?.getAttribute("src") || "");
  if (!audio || !id) return false;

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
  youtubeFrame.src = `https://www.youtube.com/embed/${encodeURIComponent(id)}?enablejsapi=1&autoplay=0&controls=0&loop=1&playlist=${encodeURIComponent(id)}&playsinline=1&rel=0`;

  youtubeFrame.addEventListener("load", () => {
    youtubeReady = true;
    if (pendingCommand) {
      const command = pendingCommand;
      pendingCommand = null;
      sendYouTubeCommand(command.func, command.args);
    }
  }, { once: true });

  document.body.appendChild(youtubeFrame);

  if (!audio.__youtubeAudioPatched) {
    const nativePlay = audio.play.bind(audio);
    const nativePause = audio.pause.bind(audio);
    audio.play = () => {
      const currentId = getYouTubeId(audio.src || audio.getAttribute("src") || "");
      if (currentId) {
        queueYouTubeCommand("playVideo");
        return Promise.resolve();
      }
      return nativePlay();
    };
    audio.pause = () => {
      const currentId = getYouTubeId(audio.src || audio.getAttribute("src") || "");
      if (currentId) {
        queueYouTubeCommand("pauseVideo");
        return;
      }
      nativePause();
    };
    audio.__youtubeAudioPatched = true;
  }

  return true;
};

const hideSoundAfterEnter = () => {
  if (document.getElementById("church-audio-style")) return;
  const style = document.createElement("style");
  style.id = "church-audio-style";
  style.textContent = ".page.entered .sound{display:none!important}";
  document.head.appendChild(style);
};

const observeAudio = () => {
  hideSoundAfterEnter();
  const audio = document.querySelector("audio[aria-hidden='true']");
  if (!audio) return false;
  if (observedAudio === audio) return true;
  observedAudio = audio;
  setupYouTubeAudio(audio);
  const observer = new MutationObserver(() => setupYouTubeAudio(audio));
  observer.observe(audio, { attributes: true, attributeFilter: ["src"] });
  return true;
};

// React renders the audio element after DOMContentLoaded in some browsers.
// Watch the document as well as trying immediately so initialization cannot race React.
const startObserver = () => {
  observeAudio();
  if (!document.body) return;
  const rootObserver = new MutationObserver(() => observeAudio());
  rootObserver.observe(document.body, { childList: true, subtree: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", startObserver, { once: true });
} else {
  startObserver();
}
