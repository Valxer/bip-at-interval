import { signal, Signal, WritableSignal } from '@angular/core';
import { AudioRequest } from '../../core/models/audio-config';

export interface LoopState {
  isPlaying: boolean;
  secondsRemaining: number;
  intervalTotal: number;
  volume: number;
  fileName: string | null;
}
export class HomeViewModel {
  private readonly STORAGE_KEY = 'audio_loop_settings';

  private readonly _state: WritableSignal<LoopState> = signal({
    isPlaying: false,
    secondsRemaining: 0,
    intervalTotal: 15,
    volume: 0.75,
    fileName: null
  });

  public readonly state: Signal<LoopState> = this._state.asReadonly();
  
  private readonly _audioElement: HTMLAudioElement = new Audio();
  private _mainIntervalId: any = null;
  private _countdownId: any = null;

  constructor() {
    this.#loadSettings();
    this._audioElement.volume = this._state().volume;
  }

  public startLoop(file: File, intervalSeconds: number): void {
    this.#clearTimers();
    this.#setupAudio(file);
    
    this._state.update(s => ({ 
      ...s, 
      isPlaying: true, 
      intervalTotal: intervalSeconds,
      secondsRemaining: intervalSeconds,
      fileName: file.name 
    }));

    this.#executeCycle();
  }

  public stop(): void {
    this.#clearTimers();
    this._audioElement.pause();
    this._state.update(s => ({ ...s, isPlaying: false, secondsRemaining: 0 }));
  }

  #saveSettings(): void {
    const settings = {
      intervalTotal: this._state().intervalTotal,
      volume: this._state().volume
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
  }

  #loadSettings(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const { intervalTotal, volume } = JSON.parse(saved);
      this._state.update(s => ({ ...s, intervalTotal, volume }));
    }
  }

  public setVolume(value: number): void {
    const clampedVolume = Math.max(0, Math.min(1, value));
    this._audioElement.volume = clampedVolume;
    this._state.update(s => ({ ...s, volume: clampedVolume }));
    this.#saveSettings();
  }

  public setInterval(value: number): void {
    this._state.update(s => ({ ...s, intervalTotal: value }));
    this.#saveSettings();
  }

  #setupAudio(file: File): void {
    this._audioElement.src = URL.createObjectURL(file);
    this._audioElement.load();
  }

  #executeCycle(): void {
    this.#playAudio();
    this.#startCountdown();

    this._mainIntervalId = setInterval(() => {
      this.#playAudio();
      this.#resetCountdown();
    }, this._state().intervalTotal * 1000);
  }

  #playAudio(): void {
    this._audioElement.currentTime = 0;
    this._audioElement.play().catch(console.error);
  }

  #startCountdown(): void {
    this._countdownId = setInterval(() => {
      this._state.update(s => ({
        ...s,
        secondsRemaining: s.secondsRemaining > 0 ? s.secondsRemaining - 1 : 0
      }));
    }, 1000);
  }

  #resetCountdown(): void {
    this._state.update(s => ({ ...s, secondsRemaining: s.intervalTotal }));
  }

  #clearTimers(): void {
    if (this._mainIntervalId) clearInterval(this._mainIntervalId);
    if (this._countdownId) clearInterval(this._countdownId);
  }
}