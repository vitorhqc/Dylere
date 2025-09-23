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
    const idmerc = searchParams.get('id_merc') ?? '';
    const db = await getConnection();
    const mercadorias = await QueryMercadoria(db, idmerc);
    return NextResponse.json(mercadorias);
}

export async function PATCH(Req: NextRequest){
    const { searchParams } = new URL(Req.url);
    const codend = searchParams.get('codend') ?? '';
    const idmerc = searchParams.get('idmerc') ?? '';
    const body = await Req.json();
    const quanti = body['quantidade'];
    const db = await getConnection();
    const result = UpdateQuantidade(db, [codend, idmerc, quanti]);
    return NextResponse.json(result);
}

export async function POST(Req: NextRequest){
    const body = await Req.json();
    console.log(body);
    const quantFinal = body['quantidade'];
    const db = await getConnection();
    const quantidade = await PegarQuantidadeTotal(db, [body['codend'], body['idmerc']]);
    console.log(quantidade);
    const quantidadeTotal = Number(quantFinal) - Number(quantidade[0]['qtesaldo']);
    console.log(quantidadeTotal);
    const datahora = getDataHora();
    const data = datahora[0];
    const hora = datahora[1];
    const db3 = await getConnection();
    const wms_idmovimento = await QueryID(db3, ['WMS_MOVIMENTO']);
    console.log('wms_movimento: ', wms_idmovimento);
    const dbb = await getConnection();
    const postResult = await InsertWMSMovimentoItem(dbb, [body['codend'], body['idmerc'], wms_idmovimento[0]['codigo'], body['user'], data, hora, quantidadeTotal.toString()])
    console.log(postResult);
    return new Response(JSON.stringify(postResult), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
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

function InsertWMSMovimentoItem(db: firebird.Database, [codend = '', idmerc = '', wms_movimento = '', user = '', data = '', hora = '', quant = '']): Promise<any>  {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (codend != '' && idmerc != '' && user != '' && wms_movimento != '') {
            codend = `${codend}`;
            idmerc = `${idmerc}`;
            user = `${user}`;
            data = `${data}`;
            hora = `${hora}`;
            quant = `${quant}`;
            wms_movimento = `${wms_movimento}`
            sql = 'INSERT INTO WMS_MOVIMENTO (CODENDERECOMER,ID_MERCADORIA, WMS_MOVIMENTO,DATA,HORA,ID_FUNCIONARIO,QUANTIDADE) VALUES (?,?,?,?,?,?,?) ;';
            params = [codend, idmerc, wms_movimento, data, hora, user, quant];
        }
        else {
            return reject('Não foi possível fazer o insert na tabela WMS_MOVIMENTO!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function PegarQuantidadeTotal(db: firebird.Database, [codend = '', idmerc = '']): Promise<any>  {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (codend != '' && idmerc != '') {
            codend = `${codend}`;
            idmerc = `${idmerc}`;
            sql = 'SELECT SUM(QUANTIDADE) as qtesaldo FROM VW_WMS_MOVIMENTO_ITEM WHERE (ID_MERCADORIA = ? AND CODENDERECOMER = ?)';
            params = [idmerc, codend];
        }
        else {
            return reject('Não foi possível atualizar o saldo!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function QueryID(db: firebird.Database, [campo = '']): Promise<any>  {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (campo != '') {
            campo = `${campo}`;
            sql = 'SELECT * FROM SP_NOVO_CODIGO(?)';
            params = [campo];
        }
        else {
            return reject('Não foi possível atualizar o saldo!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function UpdateQuantidade(db: firebird.Database, [codend = '', idmerc = '', quanti = '']): Promise<any> {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (codend != '' && idmerc != '' && quanti != '') {
            codend = `${codend}`;
            idmerc = `${idmerc}`;
            quanti = `${quanti}`;
            sql = 'UPDATE WMS_MERCADORIA_ENDERECO SET QUANTIDADE = ? where id_mercadoria = ? and CODENDERECOMER = ?';
            params = [quanti, idmerc, codend];
        }
        else {
            return reject('Não foi possível atualizar o saldo!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function QueryMercadoria(db: firebird.Database, id: string): Promise<any>{
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (id) {
            id = `${id}`;
            sql = 'SELECT DESCRICAO FROM EST_MERCADORIA WHERE ID_MERCADORIA = ?';
            params = [id];
        }
        else {
            return reject('Não foi possível buscar mercadoria!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}