class StatsManager {
  private static instance: StatsManager;

  private reported = false;

  private constructor() {}

  static getInstance() {
    if (!StatsManager.instance) {
      StatsManager.instance = new StatsManager();
    }
    return StatsManager.instance;
  }

  // -----------------------------
  // Reset when switching videos
  // -----------------------------
  reset() {
    this.reported = false;
  }

  // -----------------------------
  // Check if viewing is complete
  // -----------------------------
  async checkAndReport(
    playerState: any,
    videoId: string,
    liftId: string,
    sendFn: (payload: any) => Promise<void>
  ) {
    if (this.reported) return;
    if (playerState.mode !== "full") return;

    const { maxWatchedTime, duration } = playerState;

    if (duration > 0 && maxWatchedTime >= duration * 0.99) {
      this.reported = true;

      const payload = {
        videoId,
        liftId,
        timestamp: Date.now(),
        event: "view_completed"
      };

      try {
        await sendFn(payload);
      } catch (err) {
        console.error("StatsManager error:", err);
      }
    }
  }
}

export default StatsManager.getInstance();
