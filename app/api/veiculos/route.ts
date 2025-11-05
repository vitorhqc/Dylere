import { NextRequest, NextResponse } from "next/server";
import firebird from "node-firebird"

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

export async function GET(Req: NextRequest) {
   const { searchParams } = new URL(Req.url);
    const placa = searchParams.get('placa') ?? '';
    const db = await getConnection();
    const data = await QueryVeiculo(db, placa);
    return NextResponse.json(data);
}

function getConnection(): Promise<firebird.Database> {
    return new Promise((resolve, reject) => {
        firebird.attach(dboptions, (err, db) => {
            if (err) return reject(err);
            resolve(db);
        });
    });
}

function QueryVeiculo(db: firebird.Database, placa: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let sql = 'SELECT PLACA, DESCRICAO FROM WMS_VEICULO WHERE STATUS LIKE ?';
        let params: string[] = [];
        params = ['A'];
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach
            if (err) return reject(err);
            resolve(result);
        });
    });
}