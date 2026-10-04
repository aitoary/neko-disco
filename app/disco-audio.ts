export type SoundState = 'off' | 'loading' | 'playing' | 'error';

const INTRO_URL = '/music-samples/STAR-POP-EXPRESS-intro-v1.wav';
const LOOP_URL = '/music-samples/STAR-POP-EXPRESS-loop-v1.wav';
// Four bars at 126 BPM; the intro's remaining release overlaps the loop.
const INTRO_SECONDS = 16 * 60 / 126;

type Buffers = { intro: AudioBuffer; body: AudioBuffer };

export class DiscoAudioPlayer {
  state: SoundState = 'off';
  private context?: AudioContext;
  private buffers?: Buffers;
  private loading?: Promise<Buffers>;
  private voices: AudioBufferSourceNode[] = [];
  private nodes: AudioNode[] = [];
  private output?: GainNode;
  private generation = 0;
  private disposed = false;
  private abort = new AbortController();
  private onStateChange: (state: SoundState) => void;

  constructor(onStateChange: (state: SoundState) => void) {
    this.onStateChange = onStateChange;
  }

  private setState(state: SoundState, notify = true) {
    this.state = state;
    if (notify && !this.disposed) this.onStateChange(state);
  }

  private load(context: AudioContext): Promise<Buffers> {
    if (this.buffers) return Promise.resolve(this.buffers);
    if (this.loading) return this.loading;
    const read = async (url: string) => {
      const response = await fetch(url, { signal: this.abort.signal });
      if (!response.ok) throw new Error('Audio unavailable');
      return context.decodeAudioData(await response.arrayBuffer());
    };
    this.loading = Promise.all([read(INTRO_URL), read(LOOP_URL)])
      .then(([intro, body]) => {
        if (intro.duration < INTRO_SECONDS || body.duration <= 0) {
          throw new Error('Invalid audio');
        }
        this.buffers = { intro, body };
        return this.buffers;
      })
      .finally(() => { this.loading = undefined; });
    return this.loading;
  }

  async toggle() {
    if (this.disposed) return;
    if (this.state === 'loading' || this.state === 'playing') {
      this.stop();
      return;
    }
    const generation = ++this.generation;
    this.setState('loading');
    try {
      if (!this.context) {
        const Context = window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Context) throw new Error('Audio unsupported');
        this.context = new Context({ sampleRate: 44100 });
      }
      const context = this.context;
      // Resume directly inside the click gesture, before fetching or decoding.
      const resume = context.resume();
      const [, buffers] = await Promise.all([resume, this.load(context)]);
      if (generation !== this.generation || this.disposed) return;
      if (context.state !== 'running') throw new Error('Audio suspended');

      const output = context.createGain();
      output.gain.value = .5;
      output.connect(context.destination);
      this.output = output;
      this.nodes.push(output);
      const at = context.currentTime + .06;
      const loopAt = at + INTRO_SECONDS;

      const intro = context.createBufferSource();
      intro.buffer = buffers.intro;
      intro.connect(output);
      this.voices.push(intro);

      const body = context.createBufferSource();
      body.buffer = buffers.body;
      body.loop = true;
      body.loopStart = 0;
      body.loopEnd = buffers.body.duration;
      const fade = context.createGain();
      fade.gain.setValueAtTime(0, loopAt);
      fade.gain.linearRampToValueAtTime(1, loopAt + .005);
      body.connect(fade);
      fade.connect(output);
      this.voices.push(body);
      this.nodes.push(fade);

      // One audio clock schedules the transition; a single buffer loops forever.
      intro.start(at);
      body.start(loopAt);
      this.setState('playing');
    } catch {
      if (generation !== this.generation || this.disposed) return;
      this.stop(false);
      this.setState('error');
    }
  }

  stop(notify = true) {
    this.generation++;
    const voices = this.voices;
    const nodes = this.nodes;
    this.voices = [];
    this.nodes = [];
    if (this.context && this.output) {
      const now = this.context.currentTime;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setTargetAtTime(0, now, .005);
      for (const voice of voices) {
        try { voice.stop(now + .03); } catch { /* Already stopped. */ }
      }
      setTimeout(() => {
        for (const node of [...voices, ...nodes]) node.disconnect();
      }, 50);
    }
    this.output = undefined;
    this.setState('off', notify);
  }

  dispose() {
    this.stop(false);
    this.disposed = true;
    this.abort.abort();
    if (this.context && this.context.state !== 'closed') {
      void this.context.close().catch(() => {});
    }
  }
}
