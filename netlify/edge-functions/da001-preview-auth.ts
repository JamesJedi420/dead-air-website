declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

type EdgeContext = {
  next(): Promise<Response>;
};

const privateResponse = (body: string, status: number) =>
  new Response(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });

const unauthorized = () => {
  const response = privateResponse("Private preview authentication required.", 401);
  response.headers.set("WWW-Authenticate", 'Basic realm="Dead Air private preview", charset="UTF-8"');
  return response;
};

const constantTimeEqual = (left: string, right: string) => {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let difference = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    difference |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return difference === 0;
};

const readBasicCredentials = (request: Request) => {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Basic ")) return null;

  try {
    const decoded = atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator < 0) return null;
    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
};

export default async (request: Request, context: EdgeContext) => {
  if (Netlify.env.get("DA001_PRIVATE_PREVIEW") !== "1") {
    return context.next();
  }

  const expectedBranch = Netlify.env.get("DA001_PRIVATE_PREVIEW_BRANCH") ?? "agent/da001-private-preview";
  const deployContext = Netlify.env.get("CONTEXT");
  const headBranch = Netlify.env.get("HEAD");
  if (deployContext !== "deploy-preview" || headBranch !== expectedBranch) {
    return privateResponse("Private preview activation context is invalid.", 503);
  }

  const expectedPassword = Netlify.env.get("DA001_PREVIEW_PASSWORD");
  if (!expectedPassword || expectedPassword.length < 32) {
    return privateResponse("Private preview access is not configured securely.", 503);
  }

  const credentials = readBasicCredentials(request);
  if (
    !credentials ||
    !constantTimeEqual(credentials.username, "preview") ||
    !constantTimeEqual(credentials.password, expectedPassword)
  ) {
    return unauthorized();
  }

  const response = await context.next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const config = {
  path: "/*",
};
