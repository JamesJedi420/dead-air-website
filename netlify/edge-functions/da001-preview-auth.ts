declare const Netlify: {
  env: {
    get(name: string): string | undefined;
  };
};

type EdgeContext = {
  next(): Promise<Response>;
};

const unauthorized = () =>
  new Response("Private preview authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Dead Air private preview", charset="UTF-8"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });

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

  const expectedPassword = Netlify.env.get("DA001_PREVIEW_PASSWORD");
  if (!expectedPassword) {
    return new Response("Private preview access is not configured.", {
      status: 503,
      headers: {
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow, noarchive",
      },
    });
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
