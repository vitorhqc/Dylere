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
    const senha = searchParams.get('senha') ?? '';
    const apelido = searchParams.get('apelido') ?? '';
    const params: [string, string] = [senha, apelido];
    const db = await getConnection();
    const idUser = await QueryUser(db, params);
    return NextResponse.json(idUser);
}

function getConnection(): Promise<firebird.Database> {
    return new Promise((resolve, reject) => {
        firebird.attach(dboptions, (err, db) => {
            if (err) return reject(err);
            resolve(db);
        });
    });
}

function QueryUser(db: firebird.Database, [senha = '', apelido = '']): Promise<any> {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (senha != '' && apelido != '') {
            senha = `${senha}`;
            const id = parseInt(apelido) ? apelido : '-1';
            apelido = `%${apelido.trim()}%`;
            sql = 'SELECT ID_FUNCIONARIO FROM USR_FUNCIONARIO WHERE SENHA LIKE ? AND (APELIDO LIKE ? OR ID_FUNCIONARIO = ?)';
            params = [senha, apelido, id];
        }
        else {
            return reject('Código em branco!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach
            if (err) return reject(err);
            resolve(result);
        });
    });
}