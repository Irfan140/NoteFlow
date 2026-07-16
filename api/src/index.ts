import { env } from "./config/env";
import app from "./app";

app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${env.PORT}`);
});
