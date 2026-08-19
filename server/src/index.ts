import { env } from "./config/env";
import app from "./app";
import { logger } from "./libs/logger";

app.listen(env.PORT, "0.0.0.0", () => {
  logger.info({ port: env.PORT }, "Server started");
});
