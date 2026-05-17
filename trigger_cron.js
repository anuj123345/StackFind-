import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
fetch("http://localhost:3000/api/cron/discover?secret=" + process.env.CRON_SECRET)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
