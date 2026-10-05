(() => {
  const panel = document.getElementById("loop-player");
  const playButton = document.getElementById("loop-play");
  const seamButton = document.getElementById("loop-seam");
  const status = document.getElementById("loop-status");
  const progress = document.getElementById("loop-progress");
  const time = document.getElementById("loop-time");
  const volume = document.getElementById("loop-volume");
  const nativeTracks = [...document.querySelectorAll("audio")];
  let context,
    buffers,
    loading,
    state = "idle",
    generation = 0,
    voices = [],
    output;
  let animation,
    loopStartAt = 0,
    offset = 0,
    introStartAt = 0,
    introSeconds = 0;
  const format = (seconds) =>
    `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
  const showStatus = (text) => {
    if (status.textContent !== text) status.textContent = text;
  };

  function stop() {
    generation++;
    if (animation) cancelAnimationFrame(animation);
    const oldVoices = voices,
      oldOutput = output;
    voices = [];
    output = undefined;
    if (context && oldOutput) {
      const now = context.currentTime;
      oldOutput.gain.cancelScheduledValues(now);
      oldOutput.gain.setTargetAtTime(0, now, 0.005);
      for (const voice of oldVoices) {
        try {
          voice.stop(now + 0.03);
        } catch {}
      }
      setTimeout(() => {
        oldVoices.forEach((voice) => voice.disconnect());
        oldOutput.disconnect();
      }, 45);
    }
    state = "idle";
    playButton.textContent = "イントロから再生";
    playButton.setAttribute("aria-pressed", "false");
    showStatus("停止中");
  }

  async function load() {
    if (buffers) return buffers;
    if (loading) return loading;
    const read = async (path) => {
      const response = await fetch(path);
      if (!response.ok) throw new Error("Audio unavailable");
      return context.decodeAudioData(await response.arrayBuffer());
    };
    loading = Promise.all([read(panel.dataset.intro), read(panel.dataset.body)])
      .then(([intro, body]) => {
        buffers = { intro, body };
        progress.max = body.duration;
        return buffers;
      })
      .finally(() => {
        loading = undefined;
      });
    return loading;
  }

  function update() {
    if (state !== "playing") return;
    const now = context.currentTime;
    if (introSeconds && now < loopStartAt) {
      showStatus("イントロを再生中");
      time.textContent = `イントロ ${format(Math.max(0, now - introStartAt))} / ${format(Math.ceil(introSeconds))}`;
      progress.value = 0;
    } else {
      const position =
        (((now - loopStartAt + offset) % buffers.body.duration) + buffers.body.duration) %
        buffers.body.duration;
      showStatus("本編をループ再生中");
      time.textContent = `${format(position)} / ${format(Math.ceil(buffers.body.duration))}`;
      progress.value = position;
    }
    animation = requestAnimationFrame(update);
  }

  async function start(fromSeam = false) {
    stop();
    const ownGeneration = generation;
    state = "loading";
    playButton.textContent = "読み込みを中止";
    showStatus("音源を読み込んでいます…");
    nativeTracks.forEach((track) => track.pause());
    try {
      if (!context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!Context) throw new Error("Audio unsupported");
        context = new Context({ sampleRate: 44100 });
      }
      await context.resume();
      const loaded = await load();
      if (generation !== ownGeneration) return;
      output = context.createGain();
      output.gain.value = Number(volume.value) / 100;
      output.connect(context.destination);
      const at = context.currentTime + 0.06;
      introSeconds = fromSeam ? 0 : Number(panel.dataset.introSeconds);
      introStartAt = at;
      loopStartAt = at + introSeconds;
      offset = fromSeam ? Math.max(0, loaded.body.duration - 8) : 0;
      if (!fromSeam) {
        const intro = context.createBufferSource();
        intro.buffer = loaded.intro;
        intro.connect(output);
        intro.start(at);
        voices.push(intro);
      }
      const body = context.createBufferSource();
      body.buffer = loaded.body;
      body.loop = true;
      body.loopStart = 0;
      body.loopEnd = loaded.body.duration;
      const fade = context.createGain();
      fade.gain.setValueAtTime(0, loopStartAt);
      fade.gain.linearRampToValueAtTime(1, loopStartAt + 0.005);
      body.connect(fade);
      fade.connect(output);
      body.start(loopStartAt, offset);
      voices.push(body);
      state = "playing";
      playButton.textContent = "停止";
      playButton.setAttribute("aria-pressed", "true");
      update();
    } catch {
      if (generation !== ownGeneration) return;
      stop();
      showStatus("音源を読み込めませんでした。下のWAVを保存してお聴きください。");
    }
  }

  playButton.addEventListener("click", () => (state === "idle" ? start(false) : stop()));
  seamButton.addEventListener("click", () => start(true));
  volume.addEventListener("input", () => {
    if (context && output)
      output.gain.setTargetAtTime(Number(volume.value) / 100, context.currentTime, 0.015);
  });
  for (const track of nativeTracks) {
    track.volume = 0.8;
    track.addEventListener("play", () => {
      stop();
      nativeTracks.forEach((other) => {
        if (other !== track) other.pause();
      });
    });
    track.addEventListener("error", () => {
      const message = track.nextElementSibling;
      if (message?.classList.contains("error")) message.hidden = false;
    });
  }
  window.addEventListener("pagehide", stop);
})();
