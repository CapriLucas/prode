export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.log("[migrate] DATABASE_URL no configurada, omitiendo migraciones.");
    return;
  }

  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  const postgres = (await import("postgres")).default;

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log("[migrate] Aplicando migraciones...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("[migrate] Migraciones aplicadas.");
  } finally {
    await sql.end();
  }
}
