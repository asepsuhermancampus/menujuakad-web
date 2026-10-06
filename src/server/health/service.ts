export type HealthReport = {
  status: "ok" | "not_ready";
  checks: { application: "ok"; database: "ok" | "not_configured" | "unavailable" };
};

type HealthDependencies = {
  isDatabaseConfigured: () => boolean;
  pingDatabase: () => Promise<void>;
};

export async function checkHealth(dependencies: HealthDependencies): Promise<HealthReport> {
  try {
    if (!dependencies.isDatabaseConfigured()) {
      return {
        status: "not_ready",
        checks: { application: "ok", database: "not_configured" },
      };
    }

    await dependencies.pingDatabase();
    return { status: "ok", checks: { application: "ok", database: "ok" } };
  } catch {
    return { status: "not_ready", checks: { application: "ok", database: "unavailable" } };
  }
}
