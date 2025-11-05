import { NextRequest, NextResponse } from "next/server";
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

export async function GET(Req: NextRequest) {
   const { searchParams } = new URL(Req.url);
    const placa = searchParams.get('placa') ?? '';
    const volume = searchParams.get('volume') ?? '';
    const db = await getConnection();
    const volumes = await QueryVolumesFromPlaca(db, placa, volume);
    return NextResponse.json(volumes);
}

export async function POST(Req: NextRequest){
    const body = await Req.json();
    const volume = body['volume'];
    const placa = body['placa'];
    const coduser = body['coduser'];
    const db = await getConnection();
    try {
        await updateVolume(db, placa, volume, coduser);
    
        // ✅ Retorna apenas status 201, sem body
        return new NextResponse(null, { status: 201 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ erro: "Falha ao inserir" }, { status: 400 });
      }   
}

function QueryVolumesFromPlaca(db: firebird.Database,placa: string, volume = ''): Promise<any>{
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (placa != '') {
            placa = `${placa}`;            
            sql = `SELECT VOLUME FROM WMS_CARREGAMENTO_LOTE WHERE PLACA = ? AND STATUS = 'A'`;
            params = [placa];
            if (volume != ''){
                volume = `${volume}`;
                sql += ' AND VOLUME = ?';
                params = [placa, volume];
            }
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

function InsertVolume(db: firebird.Database, placa: string, volume: string, coduser: string): Promise<any>{
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (placa != '' && volume != '' && coduser != '') {
            placa = `${placa}`;
            volume = `${volume}`;
            coduser = `${coduser}`;
            const datahora = getDataHora();
            const data = datahora[0];
            const hora = datahora[1];
            sql = 'INSERT INTO WMS_CARREGAMENTO_LOTE (PLACA, VOLUME, DATA, HORA, ID_FUNCIONARIO) VALUES (?, ? ,? ,? ,?)';
            params = [placa, volume, data, hora, coduser];
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

function updateVolume(db: firebird.Database, placa: string, volume: string, coduser: string): Promise<any>{
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (placa != '' && volume != '' && coduser != '') {
            placa = `${placa}`;
            volume = `${volume}`;
            coduser = `${coduser}`;
            const datahora = getDataHora();
            const data = datahora[0];
            const hora = datahora[1];
            sql = 'UPDATE WMS_CARREGAMENTO_LOTE SET PLACA = ?, DATA = ?, HORA = ?, ID_FUNCIONARIO = ? WHERE VOLUME = ?';
            params = [placa, data, hora, coduser, volume];
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

function getConnection(): Promise<firebird.Database> {
    return new Promise((resolve, reject) => {
        firebird.attach(dboptions, (err, db) => {
            if (err) return reject(err);
            resolve(db);
        });
    });
}

function getDataHora(): string[]{
    const agora = new Date();

    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0'); // meses começam do zero!
    const ano = agora.getFullYear();
    
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    
    const data = `${dia}.${mes}.${ano}`;
    const hora = `${horas}:${minutos}:${segundos}`;
    return [data, hora];
}