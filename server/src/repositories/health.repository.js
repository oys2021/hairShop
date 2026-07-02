export function readRuntimeHealth() {
  return {
    processId: process.pid,
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    memoryRssBytes: process.memoryUsage().rss,
    checkedAt: new Date().toISOString(),
  };
}
