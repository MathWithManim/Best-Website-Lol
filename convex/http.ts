import { httpRouter } from "convex/server";
import { authComponent, createAuth, trustedAuthOrigins } from "./auth";

const http = httpRouter();

// CORS handling is required for client side frameworks
authComponent.registerRoutesLazy(http, createAuth, {
  basePath: "/api/auth",
  cors: true,
  trustedOrigins: trustedAuthOrigins(),
});

export default http;