import { createHash, randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";

const VISITOR_COOKIE = "mith_unique_visitor";
const VISITOR_SET = "portfolio:unique-visitors";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 400;

const ADD_VISITOR = `
  local added = redis.call("SADD", KEYS[1], ARGV[1])
  local count = redis.call("SCARD", KEYS[1])
  return {added, count}
`;

function getCookie(cookieHeader, name) {
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }

  return null;
}

function isVisitorId(value) {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return response.status(503).json({ error: "View counter storage is not configured" });
  }

  let visitorId = getCookie(request.headers.cookie, VISITOR_COOKIE);
  const isNewBrowser = !isVisitorId(visitorId);

  if (isNewBrowser) {
    visitorId = randomUUID();
    response.setHeader(
      "Set-Cookie",
      `${VISITOR_COOKIE}=${visitorId}; Path=/; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
    );
  }

  // Store only a one-way identifier, never an IP address or raw cookie value.
  const visitorHash = createHash("sha256").update(visitorId).digest("hex");

  try {
    const redis = Redis.fromEnv();
    const result = await redis.eval(ADD_VISITOR, [VISITOR_SET], [visitorHash]);
    const [added, count] = Array.isArray(result) ? result : [0, result];

    return response.status(200).json({ count: Number(count), newVisitor: Number(added) === 1 });
  } catch (error) {
    console.error("Unable to update unique visitor count", error);
    return response.status(500).json({ error: "Unable to update view counter" });
  }
}
