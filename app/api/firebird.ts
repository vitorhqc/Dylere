import firebird from "node-firebird";

const dboptions: firebird.Options = {

    host: process.env.host,
    port: Number(process.env.fbport),
    database: process.env.databaseKingHost,
    user: process.env.user,
    password: process.env.password,
    lowercase_keys: (process.env.lowercase_keys == 'true'),
    role: process.env.role,
    pageSize: Number(process.env.pageSize),
    retryConnectionInterval: Number(process.env.retryConnectionInterval),
    blobAsText: (process.env.blobAsText == 'true'),
    encoding: process.env.encoding as firebird.SupportedCharacterSet,

};

const pool = firebird.pool(10, dboptions);

export async function queryFirebird<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    pool.get((err, db) => {
      if (err) return reject(err);

      db.query(sql, params, (err, result) => {
        db.detach();
        if (err) return reject(err);
        resolve(result);
      });
    });
  });
}