import app from "./app.js";
import config from "./config/config.js";
import connectDB from "./config/database.js";
import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"])

connectDB();

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});