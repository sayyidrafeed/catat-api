import { createRouter } from "../../factory";
import { auth } from "../../auth";

const authRouter = createRouter();

authRouter.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

export default authRouter;
