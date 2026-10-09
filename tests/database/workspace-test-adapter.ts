// Adapter hanya untuk pengujian: Prisma asli menjalankan SQL pada PostgreSQL WASM lokal.
import { PGlite, type Transaction as PgTransaction } from "@electric-sql/pglite";
import {
  ColumnTypeEnum as C,
  DriverAdapterError,
  type ColumnType,
  type SqlDriverAdapterFactory,
  type SqlQuery,
  type SqlResultSet,
  type SqlQueryable,
} from "@prisma/driver-adapter-utils";
const oidTypes: Record<number, ColumnType> = {
  16: C.Boolean,
  20: C.Int64,
  21: C.Int32,
  23: C.Int32,
  25: C.Text,
  1043: C.Text,
  1082: C.Date,
  1114: C.DateTime,
  1184: C.DateTime,
  114: C.Json,
  3802: C.Json,
  700: C.Float,
  701: C.Double,
};
function queryable(db: PGlite | PgTransaction): SqlQueryable {
  const query = async ({ sql, args }: SqlQuery) => {
    try {
      return await db.query<unknown[]>(sql, args, {
        rowMode: "array",
        parsers: {
          1082: (value) => value,
          1114: (value) => value.replace(" ", "T") + "Z",
          1184: (value) => new Date(value).toISOString(),
          114: (value) => value,
          3802: (value) => value,
          20: (value) => value,
        },
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "23505")
        throw new DriverAdapterError({
          kind: "UniqueConstraintViolation",
          constraint: { fields: ["slug"] },
        });
      throw error;
    }
  };
  return {
    provider: "postgres",
    adapterName: "test-pglite-workspace",
    async queryRaw(sql): Promise<SqlResultSet> {
      const result = await query(sql);
      return {
        columnNames: result.fields.map((f) => f.name),
        columnTypes: result.fields.map((f) => oidTypes[f.dataTypeID] ?? C.Enum),
        rows: result.rows,
      };
    },
    async executeRaw(sql) {
      return (await query(sql)).affectedRows ?? 0;
    },
  };
}
export function workspaceTestAdapter(db: PGlite): SqlDriverAdapterFactory {
  return {
    provider: "postgres",
    adapterName: "test-pglite-workspace",
    async connect() {
      return {
        ...queryable(db),
        getConnectionInfo: () => ({ supportsRelationJoins: false }),
        async executeScript(sql) {
          await db.exec(sql);
        },
        async dispose() {},
        async startTransaction() {
          let release: (commit: boolean) => void = () => {};
          let ready: (tx: PgTransaction) => void = () => {};
          const gate = new Promise<boolean>((resolve) => {
            release = resolve;
          });
          const started = new Promise<PgTransaction>((resolve) => {
            ready = resolve;
          });
          const rollback = new Error("test rollback");
          const complete = db
            .transaction(async (tx) => {
              ready(tx);
              if (!(await gate)) throw rollback;
            })
            .catch((error) => {
              if (error !== rollback) throw error;
            });
          const tx = await started;
          return {
            ...queryable(tx),
            options: { usePhantomQuery: true },
            async commit() {
              release(true);
              await complete;
            },
            async rollback() {
              release(false);
              await complete;
            },
          };
        },
      };
    },
  };
}
