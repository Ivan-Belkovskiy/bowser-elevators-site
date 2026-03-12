class AutoSaveManager {
  private static instance: AutoSaveManager;

  private autoSaveInterval: any = null;
  private isSaving = false;

  private constructor() {}

  static getInstance() {
    if (!AutoSaveManager.instance) {
      AutoSaveManager.instance = new AutoSaveManager();
    }
    return AutoSaveManager.instance;
  }

  startAutoSave(playerState: any, saveFn: (data: any) => Promise<void>, delaySec: number) {
    this.stopAutoSave();

    this.autoSaveInterval = setInterval(() => {
      this.saveProgress(playerState, saveFn);
    }, delaySec * 1000);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async saveProgress(playerState: any, saveFn: (data: any) => Promise<void>) {
    if (this.isSaving) return;

    this.isSaving = true;

    const payload = {
      videoId: playerState.videoId,
      currentTime: playerState.currentTime,
      maxWatchedTime: playerState.maxWatchedTime,
      duration: playerState.duration,
      mode: playerState.mode,
      timestamp: Date.now()
    };

    try {
      await saveFn(payload);
    } catch (err) {
      console.error("AutoSave error:", err);
    }

    this.isSaving = false;
  }

  async loadProgress(loadFn: (videoId: string) => Promise<any>, videoId: string) {
    try {
      const data = await loadFn(videoId);
      return data;
    } catch (err) {
      console.error("Load progress error:", err);
      return null;
    }
  }

  reset() {
    this.stopAutoSave();
    this.isSaving = false;
  }
}

export default AutoSaveManager.getInstance();
