(() => {
  // ── DOM ──
  const viewHome = document.getElementById("viewHome");
  const viewLoading = document.getElementById("viewLoading");
  const viewError = document.getElementById("viewError");
  const viewPlayer = document.getElementById("viewPlayer");

  const urlInput = document.getElementById("urlInput");
  const playBtn = document.getElementById("playBtn");
  const pasteBtn = document.getElementById("pasteBtn");
  const homeError = document.getElementById("homeError");

  const loadingUrlText = document.getElementById("loadingUrlText");
  const loadingStatus = document.getElementById("loadingStatus");

  const errorMsgText = document.getElementById("errorMsgText");

  const playerContainer = document.getElementById("playerContainer");
  const video = document.getElementById("videoPlayer");
  const bigPlayOverlay = document.getElementById("bigPlayOverlay");
  const bigPlayIcon = document.getElementById("bigPlayIcon");

  const playPauseBtn = document.getElementById("playPauseBtn");
  const ppIcon = document.getElementById("ppIcon");
  const skipBackBtn = document.getElementById("skipBackBtn");
  const skipFwdBtn = document.getElementById("skipFwdBtn");
  const curTimeEl = document.getElementById("curTime");
  const durTimeEl = document.getElementById("durTime");
  const progressBar = document.getElementById("progressBar");
  const progressPlayed = document.getElementById("progressPlayed");
  const progressBuffered = document.getElementById("progressBuffered");

  const muteBtn = document.getElementById("muteBtn");
  const volIcon = document.getElementById("volIcon");
  const volSlider = document.getElementById("volSlider");
  const settingsBtn = document.getElementById("settingsBtn");
  const pipBtn = document.getElementById("pipBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const fsIcon = document.getElementById("fsIcon");
  const sourceUrl = document.getElementById("sourceUrl");

  const settingsOverlay = document.getElementById("settingsOverlay");
  const settingsPanel = document.getElementById("settingsPanel");
  const settingsPanelMobile = document.getElementById("settingsPanelMobile");

  const themeToggle = document.getElementById("themeToggle");
  const themeIconDark = document.getElementById("themeIconDark");
  const themeIconLight = document.getElementById("themeIconLight");
  const themeLabel = document.getElementById("themeLabel");

  let directURL = "";
  let controlsTimeout;
  let loadingInterval;
  let loadingCancelled = false;
  let dragging = false;

  // ── Theme Toggle ──
  function getSystemTheme() {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      if (themeIconDark) themeIconDark.classList.remove("hidden");
      if (themeIconLight) themeIconLight.classList.add("hidden");
      if (themeLabel) themeLabel.textContent = "Dark";
    } else {
      document.documentElement.classList.remove("dark");
      if (themeIconDark) themeIconDark.classList.add("hidden");
      if (themeIconLight) themeIconLight.classList.remove("hidden");
      if (themeLabel) themeLabel.textContent = "Light";
    }
  }

  function initTheme() {
    const saved = localStorage.getItem("streamplay-theme");
    if (saved) {
      applyTheme(saved);
    } else {
      applyTheme(getSystemTheme());
    }
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("streamplay-theme", next);
  });

  // Listen for system theme changes only if user hasn't set a preference
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", e => {
    if (!localStorage.getItem("streamplay-theme")) {
      applyTheme(e.matches ? "dark" : "light");
    }
  });

  initTheme();

  // ── Helpers ──
  function formatTime(s) {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + String(sec).padStart(2, "0");
  }

  function showView(name) {
    [viewHome, viewLoading, viewError, viewPlayer].forEach(v => v.classList.add("hidden"));
    if (name !== "player") {
      video.pause();
      video.removeAttribute("src");
      video.load();
      playerContainer.classList.remove("playing");
    }
    closeSettings();

    switch (name) {
      case "home":
        viewHome.classList.remove("hidden");
        document.title = "StreamPlay | Instant Video Player";
        break;
      case "loading":
        viewLoading.classList.remove("hidden");
        document.title = "StreamPlay | Fetching Content";
        break;
      case "error":
        viewError.classList.remove("hidden");
        document.title = "StreamPlay | Error";
        break;
      case "player":
        viewPlayer.classList.remove("hidden");
        document.title = "StreamPlay | Focus Player";
        break;
    }
  }

  function showControls() {
    playerContainer.classList.add("show-controls");
    clearTimeout(controlsTimeout);
    if (!video.paused) {
      controlsTimeout = setTimeout(() => playerContainer.classList.remove("show-controls"), 3000);
    }
  }

  // ── Loading status rotation ──
  const statusTexts = [
    "Fetching your video...",
    "Decoding stream...",
    "Optimizing for playback...",
    "Initializing buffer..."
  ];
  let statusIdx = 0;
  function startLoadingAnim() {
    statusIdx = 0;
    loadingStatus.textContent = statusTexts[0];
    loadingInterval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statusTexts.length;
      loadingStatus.style.opacity = 0;
      setTimeout(() => {
        loadingStatus.textContent = statusTexts[statusIdx];
        loadingStatus.style.opacity = 1;
      }, 300);
    }, 3000);
  }
  function stopLoadingAnim() {
    clearInterval(loadingInterval);
  }

  // ── Cancel ──
  window.cancelLoading = function() {
    loadingCancelled = true;
    stopLoadingAnim();
    showView("home");
  };

  // ── Extract & Play ──
  async function extractAndPlay() {
    homeError.classList.add("hidden");
    const url = urlInput.value.trim();
    if (!url) {
      homeError.innerHTML = '<div class="mt-4 p-3 bg-error/10 border border-error/30 rounded-xl text-error font-body-md text-body-md text-center">Please enter a URL.</div>';
      urlInput.focus();
      return;
    }

    loadingCancelled = false;
    loadingUrlText.textContent = url;
    showView("loading");
    startLoadingAnim();

    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (loadingCancelled) return;

      if (!res.ok) throw new Error(data.error || "Failed to extract video.");

      directURL = data.directURL;
      sourceUrl.textContent = directURL;

      video.src = directURL;
      video.load();

      stopLoadingAnim();
      showView("player");
    } catch (err) {
      if (loadingCancelled) return;
      stopLoadingAnim();
      errorMsgText.textContent = err.message || "Check the URL and try again, or try a different link.";
      showView("error");
    }
  }

  // ── Paste helper ──
  window.pasteFromClipboard = async function() {
    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text;
      urlInput.focus();
      homeError.classList.add("hidden");
    } catch {}
  };

  // ── Events: Home ──
  playBtn.addEventListener("click", extractAndPlay);
  urlInput.addEventListener("keydown", e => { if (e.key === "Enter") extractAndPlay(); });
  pasteBtn.addEventListener("click", pasteFromClipboard);

  // ── Events: Video ──
  video.addEventListener("loadedmetadata", () => {
    durTimeEl.textContent = formatTime(video.duration);
    showControls();
  });
  video.addEventListener("timeupdate", () => {
    if (!dragging) {
      progressPlayed.style.width = (video.currentTime / video.duration) * 100 + "%";
      curTimeEl.textContent = formatTime(video.currentTime);
    }
  });
  video.addEventListener("progress", () => {
    if (video.buffered.length > 0) {
      const end = video.buffered.end(video.buffered.length - 1);
      progressBuffered.style.width = (end / video.duration) * 100 + "%";
    }
  });
  video.addEventListener("play", () => {
    playerContainer.classList.add("playing");
    ppIcon.textContent = "pause";
    bigPlayIcon.textContent = "pause";
    showControls();
  });
  video.addEventListener("pause", () => {
    ppIcon.textContent = "play_arrow";
    bigPlayIcon.textContent = "play_arrow";
    showControls();
  });
  video.addEventListener("ended", () => {
    ppIcon.textContent = "play_arrow";
    bigPlayIcon.textContent = "play_arrow";
    playerContainer.classList.remove("playing");
    showControls();
  });

  playerContainer.addEventListener("click", e => {
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("a")) return;
    if (video.paused) video.play(); else video.pause();
  });
  playerContainer.addEventListener("mousemove", showControls);

  playPauseBtn.addEventListener("click", e => { e.stopPropagation(); if (video.paused) video.play(); else video.pause(); });
  skipBackBtn.addEventListener("click", e => { e.stopPropagation(); video.currentTime = Math.max(0, video.currentTime - 10); });
  skipFwdBtn.addEventListener("click", e => { e.stopPropagation(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 10); });

  // Volume
  muteBtn.addEventListener("click", e => {
    e.stopPropagation();
    video.muted = !video.muted;
    updateVolIcon();
  });
  volSlider.addEventListener("input", e => {
    e.stopPropagation();
    video.volume = parseInt(e.target.value) / 100;
    video.muted = false;
    updateVolIcon();
    syncSettingsVol(e.target.value);
  });

  function updateVolIcon() {
    const vol = video.muted ? 0 : video.volume;
    volIcon.textContent = video.muted ? "volume_off" : (vol === 0 ? "volume_mute" : vol < 0.5 ? "volume_down" : "volume_up");
  }

  function syncSettingsVol(val) {
    const settingsSlider = document.getElementById("settingsVolSlider");
    const settingsSliderMobile = document.getElementById("settingsVolSliderMobile");
    const volPctLabel = document.getElementById("volPctLabel");
    const volPctLabelMobile = document.getElementById("volPctLabelMobile");
    if (settingsSlider) settingsSlider.value = val;
    if (settingsSliderMobile) settingsSliderMobile.value = val;
    if (volPctLabel) volPctLabel.textContent = val + "%";
    if (volPctLabelMobile) volPctLabelMobile.textContent = val + "%";
  }

  // Progress
  function seekFromEvent(e) {
    const rect = progressBar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = pct * (video.duration || 0);
  }
  progressBar.addEventListener("mousedown", e => { e.stopPropagation(); dragging = true; seekFromEvent(e); });
  document.addEventListener("mousemove", e => {
    if (dragging) {
      const rect = progressBar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      progressPlayed.style.width = pct * 100 + "%";
      curTimeEl.textContent = formatTime(pct * (video.duration || 0));
    }
  });
  document.addEventListener("mouseup", e => { if (dragging) { dragging = false; seekFromEvent(e); } });

  // ── Settings panel (responsive) ──
  function isMobile() {
    return window.innerWidth < 1024;
  }

  function openSettings() {
    settingsOverlay.classList.remove("opacity-0", "pointer-events-none");
    if (isMobile()) {
      settingsPanelMobile.classList.remove("translate-y-full");
      settingsPanelMobile.classList.add("translate-y-0");
    } else {
      settingsPanel.classList.remove("translate-x-full");
      settingsPanel.classList.add("translate-x-0");
    }
  }

  function closeSettings() {
    settingsOverlay.classList.add("opacity-0", "pointer-events-none");
    settingsPanel.classList.remove("translate-x-0");
    settingsPanel.classList.add("translate-x-full");
    settingsPanelMobile.classList.remove("translate-y-0");
    settingsPanelMobile.classList.add("translate-y-full");
  }

  window.toggleSettings = function() {
    const isOpen = isMobile()
      ? settingsPanelMobile.classList.contains("translate-y-0")
      : settingsPanel.classList.contains("translate-x-0");
    if (isOpen) closeSettings(); else openSettings();
  };

  settingsBtn.addEventListener("click", e => { e.stopPropagation(); toggleSettings(); });

  // Speed
  window.setSpeed = function(btn, speed) {
    btn.parentElement.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    video.playbackRate = speed;
  };

  // Volume sync from settings panel
  window.syncVolume = function(val) {
    video.volume = parseInt(val) / 100;
    volSlider.value = val;
    updateVolIcon();
    syncSettingsVol(val);
  };

  // PiP
  pipBtn.addEventListener("click", async e => {
    e.stopPropagation();
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch {}
  });

  // Fullscreen
  fullscreenBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (document.fullscreenElement) document.exitFullscreen();
    else playerContainer.requestFullscreen();
  });
  document.addEventListener("fullscreenchange", () => {
    fsIcon.textContent = document.fullscreenElement ? "fullscreen_exit" : "fullscreen";
  });

  // Keyboard
  document.addEventListener("keydown", e => {
    if (!viewPlayer.classList.contains("hidden")) {
      if (document.activeElement === urlInput) return;
      switch (e.key) {
        case " ": case "k": e.preventDefault(); if (video.paused) video.play(); else video.pause(); break;
        case "ArrowLeft": e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); showControls(); break;
        case "ArrowRight": e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); showControls(); break;
        case "ArrowUp": e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); volSlider.value = video.volume * 100; syncSettingsVol(volSlider.value); showControls(); break;
        case "ArrowDown": e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); volSlider.value = video.volume * 100; syncSettingsVol(volSlider.value); showControls(); break;
        case "m": video.muted = !video.muted; updateVolIcon(); showControls(); break;
        case "f": if (document.fullscreenElement) document.exitFullscreen(); else playerContainer.requestFullscreen(); break;
        case "Escape": {
          const settingsOpen = isMobile()
            ? settingsPanelMobile.classList.contains("translate-y-0")
            : settingsPanel.classList.contains("translate-x-0");
          if (settingsOpen) closeSettings();
          break;
        }
      }
    }
  });

  // Ambient glow parallax
  document.addEventListener("mousemove", e => {
    const glow = document.querySelector(".ambient-glow");
    if (!glow) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 50;
    const y = (e.clientY / window.innerHeight - 0.5) * 50;
    glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  });

  // Expose globals
  window.showView = showView;
})();
