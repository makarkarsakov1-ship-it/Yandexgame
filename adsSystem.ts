// src/systems/adsSystem.ts
// Yandex Games SDK wrapper — graceful fallback when SDK not available

declare global {
  interface Window {
    YaGames?: {
      init: () => Promise<YandexSDK>;
    };
  }
}

interface YandexSDK {
  adv: {
    showFullscreenAdv(params: { callbacks: { onOpen?: () => void; onClose?: (wasShown: boolean) => void; onError?: (err: Error) => void } }): void;
    showRewardedVideo(params: { callbacks: { onOpen?: () => void; onRewarded?: () => void; onClose?: () => void; onError?: (err: Error) => void } }): void;
  };
  features: {
    LoadingAPI?: { ready(): void };
  };
}

type RewardCallback = () => void;
type CloseCallback = (wasShown: boolean) => void;

class AdsSystem {
  private sdk: YandexSDK | null = null;
  private initialized = false;
  private lastInterstitialTime = 0;
  private readonly interstitialCooldown: number;

  constructor(interstitialCooldownMs: number) {
    this.interstitialCooldown = interstitialCooldownMs;
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    try {
      if (window.YaGames) {
        this.sdk = await window.YaGames.init();
        this.sdk.features.LoadingAPI?.ready();
        this.initialized = true;
        console.log('[AdsSystem] Yandex SDK initialized');
      } else {
        console.log('[AdsSystem] Yandex SDK not found — running in dev mode');
        this.initialized = true;
      }
    } catch (e) {
      console.warn('[AdsSystem] SDK init failed:', e);
      this.initialized = true;
    }
  }

  showInterstitial(onClose?: CloseCallback): void {
    const now = Date.now();
    if (now - this.lastInterstitialTime < this.interstitialCooldown) return;
    this.lastInterstitialTime = now;

    if (!this.sdk) {
      // Dev mode fallback
      setTimeout(() => onClose?.(true), 500);
      return;
    }

    this.sdk.adv.showFullscreenAdv({
      callbacks: {
        onClose: (wasShown) => onClose?.(wasShown),
        onError: (err) => {
          console.warn('[AdsSystem] Interstitial error:', err);
          onClose?.(false);
        },
      },
    });
  }

  showRewarded(onRewarded: RewardCallback, onClose?: () => void): void {
    if (!this.sdk) {
      // Dev mode — simulate reward
      setTimeout(() => {
        onRewarded();
        onClose?.();
      }, 600);
      return;
    }

    this.sdk.adv.showRewardedVideo({
      callbacks: {
        onRewarded: () => onRewarded(),
        onClose: () => onClose?.(),
        onError: (err) => {
          console.warn('[AdsSystem] Rewarded error:', err);
          onClose?.();
        },
      },
    });
  }

  canShowInterstitial(): boolean {
    return Date.now() - this.lastInterstitialTime >= this.interstitialCooldown;
  }
}

export const adsSystem = new AdsSystem(150_000);
