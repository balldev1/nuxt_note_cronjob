// server/plugins/cron.ts
export default defineNitroPlugin(() => {
  import("../cron/cleanup");
});
