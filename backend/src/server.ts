import { env } from "./config";
import { App } from "./index";

const start = async () => {
  const { server } = await App();

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch((error) => {
  console.error("Server failed", error);
  process.exit(1);
});
