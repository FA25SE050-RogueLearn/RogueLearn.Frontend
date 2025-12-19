// roguelearn-web/src/app/api/game/host/route.ts
import { NextRequest, NextResponse } from "next/server";
export const runtime = 'nodejs';

function sanitizeBaseUrl(value: string | undefined): string {
  if (!value) return "";
  const trimmed = value.trim();
  const unquoted = trimmed.replace(/^["'`]+|["'`]+$/g, "");
  return unquoted.replace(/\/+$/, "");
}

// Utility to generate a pseudo-random 6-letter join code
function generateJoinCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoid confusable chars
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

export async function POST(req: NextRequest) {
  // Extract userId from request body
  let userId: string | null = null;
  try {
    const body = await req.json();
    userId = body?.userId || null;
  } catch {
    // Body parsing failed or no body provided
  }

  // Prefer calling the backend controller that can actually run Docker.
  const controllerBase = sanitizeBaseUrl(
    process.env.HOST_CONTROLLER_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  );
  const controllerPath =
    process.env.HOST_CONTROLLER_PATH || "/api/quests/game/sessions/host";
  const controllerUrl = controllerBase
    ? `${controllerBase.replace(/\/$/, "")}${controllerPath.startsWith("/") ? controllerPath : `/${controllerPath}`
    }`
    : null;
  const enableLocalDocker =
    process.env.ENABLE_LOCAL_DOCKER === "1" ||
    process.env.ENABLE_LOCAL_DOCKER === "true";

  const gameApiKey = process.env.RL_GAME_API_KEY || process.env.GAME_API_KEY;

  try {
    let backendError: string | null = null;
    if (controllerUrl) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (gameApiKey) {
          headers["X-Game-Api-Key"] = gameApiKey;
        }
        const res = await fetch(controllerUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ userId }),
        });

        if (res.status === 404 && controllerBase.endsWith("/user-service")) {
          const altBase = controllerBase.replace(/\/user-service$/, "");
          const altUrl = `${altBase}${controllerPath.startsWith("/") ? controllerPath : `/${controllerPath}`}`;
          const retry = await fetch(altUrl, {
            method: "POST",
            headers,
            body: JSON.stringify({ userId }),
          });
          if (retry.ok) {
            const data = await retry.json();
            return NextResponse.json({ ok: true, ...data });
          }
          const text = await retry.text();
          backendError = `Backend error: ${retry.status} ${text}`;
          console.error(`[host] backend retry responded non-OK: ${backendError}`);
        }

        if (res.ok) {
          const data = await res.json();
          // Expect backend to return { joinCode, hostId, message, wsUrl }
          return NextResponse.json({ ok: true, ...data });
        }
        const text = await res.text();
        backendError = `Backend error: ${res.status} ${text}`;
        console.error(`[host] backend responded non-OK: ${backendError}`);
      } catch (err: any) {
        backendError = err?.message ?? String(err);
        console.error(`[host] backend fetch failed: ${backendError}`);
      }
      // Fall through to local/docker stub if backend fails so hosting still works in dev/prod.
    }

    // On serverless, skip local Docker unless explicitly enabled
    if (!enableLocalDocker) {
      const message = backendError
        ? `Host controller failed: ${backendError}`
        : "Host controller not configured";
      return NextResponse.json({ ok: false, error: message }, { status: 502 });
    }

    // No external backend configured: try to start a local Docker container for the Unity headless server
    // Requirements:
    // - Docker Desktop installed and running
    // - Built image available (default: roguelearn-server:latest)
    // - Unity headless logs must print a JSON line: {"event":"relay_join_code","joinCode":"ABCD1234", ...}

    try {
      const image = process.env.RL_DOCKER_IMAGE || 'roguelearn-server:latest';
      const name = process.env.RL_DOCKER_CONTAINER || `roguelearn-server-${Date.now()}`;
      const envs = [
        `-e`, `UNITY_SERVER_SCENE=${process.env.UNITY_SERVER_SCENE || 'HostUI'}`,
        `-e`, `RELAY_REGION=${process.env.RELAY_REGION || 'us-central'}`,
        `-e`, `RL_MAX_CONNECTIONS=${process.env.RL_MAX_CONNECTIONS || '20'}`,
      ];

      const dockerUserApiBase = (process.env.RL_DOCKER_USER_API_BASE || '').replace(/\/+$/, '');
      if (dockerUserApiBase) {
        envs.push('-e', `USER_API_BASE=${dockerUserApiBase}`);
      } else {
        const userApiBase = (process.env.NEXT_PUBLIC_USER_API_URL || '').replace(/\/+$/, '');
        if (userApiBase) envs.push('-e', `USER_API_BASE=${userApiBase}`);
      }
      envs.push('-e', `INSECURE_TLS=${process.env.INSECURE_TLS || '0'}`);
      if (gameApiKey) {
        envs.push('-e', `RL_GAME_API_KEY=${gameApiKey}`);
      }

      // Pass userId to Unity server if provided
      if (userId) {
        envs.push('-e', `USER_ID=${userId}`);
      }

      // Optional: map HTTP port and resource constraints to match your local run command
      const runArgs: string[] = ['run', '--rm', '--name', name, '-d'];
      const portHost = process.env.RL_DOCKER_PORT_HOST; // e.g., 8080
      const portContainer = process.env.RL_DOCKER_PORT_CONTAINER || '8080';
      if (portHost) {
        runArgs.push('-p', `${portHost}:${portContainer}`);
      }
      const cpus = process.env.RL_DOCKER_CPUS; // e.g., "2"
      if (cpus) runArgs.push('--cpus', cpus);
      const cpuSet = process.env.RL_DOCKER_CPUSET; // e.g., "0-1"
      if (cpuSet) runArgs.push('--cpuset-cpus', cpuSet);
      const memory = process.env.RL_DOCKER_MEMORY; // e.g., "8g"
      if (memory) runArgs.push('-m', memory);
      const cpuShares = process.env.RL_DOCKER_CPU_SHARES; // e.g., "128"
      if (cpuShares) runArgs.push('--cpu-shares', cpuShares);

      // Ensure PORT is passed if desired
      const portEnv = process.env.RL_DOCKER_ENV_PORT || portContainer;
      if (portEnv) envs.push('-e', `PORT=${portEnv}`);

      // Allow extra envs (comma-separated KEY=VAL)
      const extraEnvs = process.env.RL_DOCKER_EXTRA_ENVS;
      if (extraEnvs) {
        for (const pair of extraEnvs.split(',').map(s => s.trim()).filter(Boolean)) {
          envs.push('-e', pair);
        }
      }

      // Allow extra args (space-separated)
      const extraArgs = process.env.RL_DOCKER_EXTRA_ARGS;
      if (extraArgs) {
        for (const token of extraArgs.split(' ').map(s => s.trim()).filter(Boolean)) {
          runArgs.push(token);
        }
      }

      if (process.platform === 'linux') {
        runArgs.push('--add-host=host.docker.internal:host-gateway');
      }

      // Append envs and image name
      runArgs.push(...envs, image);

      const { spawn } = await import('child_process');

      await new Promise((resolve, reject) => {
        const p = spawn('docker', runArgs, { stdio: ['ignore', 'pipe', 'pipe'] });
        let err = '';
        p.stderr.on('data', (d) => (err += d.toString()));
        p.on('exit', (code) => {
          if (code === 0) resolve(true);
          else reject(new Error(err.trim() || `docker run failed (code ${code})`));
        });
      });

      // Follow logs until we see a relay_join_code event or timeout
      const timeoutMs = Number(process.env.RL_LOG_TIMEOUT_MS || 20000);
      const joinData: { joinCode?: string; raw?: string } = await new Promise((resolve, reject) => {
        const logProc = spawn('docker', ['logs', '-f', name], { stdio: ['ignore', 'pipe', 'pipe'] });
        const timer = setTimeout(() => {
          try { logProc.kill(); } catch { }
          reject(new Error('Timed out waiting for join code in container logs'));
        }, timeoutMs);
        logProc.stdout.on('data', (d) => {
          const lines = d.toString().split(/\r?\n/);
          for (const line of lines) {
            // Try JSON first
            try {
              const obj = JSON.parse(line);
              if (obj && obj.event === 'relay_join_code' && obj.joinCode) {
                clearTimeout(timer);
                try { logProc.kill(); } catch { }
                resolve({ joinCode: String(obj.joinCode), raw: line });
                return;
              }
            } catch { }
            // Fallback: plain text with code
            const m = line.match(/Relay\s+Join\s+Code\s*:\s*([A-Z0-9]{6,12})/i);
            if (m) {
              clearTimeout(timer);
              try { logProc.kill(); } catch { }
              resolve({ joinCode: m[1], raw: line });
              return;
            }
          }
        });
        logProc.stderr.on('data', () => {
          // Ignore non-fatal stderr; only reject on process exit without finding code
        });
        logProc.on('exit', () => {
          // If it exits without finding, let the timeout handle rejection
        });
      });

      if (!joinData.joinCode) {
        throw new Error('Failed to obtain join code from container logs');
      }

      // Don't create session here - let the caller (boss-fight or game page) create it with their config
      return NextResponse.json({
        ok: true,
        joinCode: joinData.joinCode,
        hostId: name,
        message: `Unity headless server started in Docker (${image}).`,
        wsUrl: process.env.NEXT_PUBLIC_GAME_WS_URL ?? null,
      });
    } catch (dockerErr) {
      // Fallback stub: simulate host setup and return a fake join code to keep development/test flows working
      await new Promise((r) => setTimeout(r, 800));
      const joinCode = generateJoinCode();

      // Don't create session here - let the caller create it with their config
      return NextResponse.json({
        ok: true,
        joinCode,
        hostId: `local-${Date.now()}`,
        message: `Docker start failed; returning a stubbed join code for development. Error: ${dockerErr}`,
        wsUrl: process.env.NEXT_PUBLIC_GAME_WS_URL ?? null,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  let hostId: string | null = null;
  try {
    const body = await req.json();
    hostId = body?.hostId || null;
  } catch {
    // ignore
  }

  if (!hostId) {
    return NextResponse.json({ ok: false, error: "Missing hostId" }, { status: 400 });
  }

  const controllerBase =
    process.env.HOST_CONTROLLER_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  const controllerPath =
    process.env.HOST_CONTROLLER_PATH || "/api/quests/game/sessions/host";
  const controllerUrl = controllerBase
    ? `${controllerBase.replace(/\/$/, "")}${controllerPath.startsWith("/") ? controllerPath : `/${controllerPath}`}/${encodeURIComponent(hostId)}`
    : null;

  const enableLocalDocker =
    process.env.ENABLE_LOCAL_DOCKER !== "0" &&
    process.env.ENABLE_LOCAL_DOCKER !== "false";
  const gameApiKey = process.env.RL_GAME_API_KEY || process.env.GAME_API_KEY;

  if (controllerUrl) {
    try {
      const headers: Record<string, string> = {};
      if (gameApiKey) {
        headers["X-Game-Api-Key"] = gameApiKey;
      }
      const res = await fetch(controllerUrl, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json({ ok: true, hostId, ...data });
      }

      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { ok: false, error: `Backend error: ${res.status} ${text}` },
        { status: 502 }
      );
    } catch (err: any) {
      return NextResponse.json(
        { ok: false, error: err?.message ?? String(err) },
        { status: 502 }
      );
    }
  }

  if (!enableLocalDocker || hostId.startsWith("local-")) {
    return NextResponse.json({ ok: true, hostId, message: "No-op stop in this environment" });
  }

  try {
    const { spawn } = await import("child_process");

    await new Promise((resolve, reject) => {
      const p = spawn("docker", ["rm", "-f", hostId], { stdio: ["ignore", "pipe", "pipe"] });
      let err = "";
      p.stderr.on("data", (d) => (err += d.toString()));
      p.on("exit", (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(err.trim() || `docker rm -f failed (code ${code})`));
      });
    });

    return NextResponse.json({ ok: true, hostId, message: "Stopped local Docker host" });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
