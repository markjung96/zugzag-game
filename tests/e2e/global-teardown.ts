import { adminCleanup } from "../helpers/admin-pg";

const teardown = async () => {
  await adminCleanup();
};

export default teardown;
