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
    const codEND = searchParams.get('codend') ?? '';
    const inserir = searchParams.get('inserir') ?? '';
    const codmerc = searchParams.get('codmerc') ?? '';
    const rua = searchParams.get('rua') ?? '';
    const edi = searchParams.get('edi') ?? '';
    const andar = searchParams.get('andar') ?? '';
    const apto = searchParams.get('apto') ?? '';
    const dep = searchParams.get('dep') ?? '';
    const isEndOnly = searchParams.get('end') ?? '';
    if (isEndOnly == 'yes') {
        const db2 = await getConnection();
        const enderecoOnly = await QueryEnderecoOnly(db2, codEND, rua, edi, andar, apto, dep)
        return NextResponse.json(enderecoOnly);
    }
    const db = await getConnection();
    const mercadorias = inserir ? await QueryEnderecoInserir(db, codEND, codmerc) : await QueryEndereco(db, codEND, rua, edi, andar, apto, dep);
    return NextResponse.json(mercadorias);
}

export async function POST(Req: NextRequest) {
    const body = await Req.json();
    const codEND = body['codend'] ?? '';
    const codmerc = body['codmerc'] ?? '';
    const quant = body['quant'] ?? '';
    const inserindo = body['insert'] ?? '';
    const db = await getConnection();
    const postResult = await PostMercEndereco(db, codEND, codmerc, quant, inserindo);
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

function PostMercEndereco(db: firebird.Database, codend = '', id_merc = '', quant = '', inserir = ''){
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        try {
            if (Number(quant) <= 0 && inserir != '') {
                return reject('Não foi possível fazer o insert na tabela WMS_MERCADORIA_ENDERECO! Quantidade menor ou igual a zero na inclusao!');
            }
        }
        catch (err){
            return reject(err);
        }
        if (codend != '' && id_merc != '' && quant != '') {
            codend = `${codend}`;
            id_merc = `${id_merc}`;
            quant = `${quant}`;
            sql = `INSERT INTO WMS_MERCADORIA_ENDERECO (CODENDERECOMER,ID_MERCADORIA, QUANTIDADE, STATUS) VALUES (?,?,? ,?) `;
            params = [codend, id_merc, quant, 'O'];
            console.log(params);
            console.log(sql);
        }
        else {
            return reject('Não foi possível fazer o insert na tabela WMS_MERCADORIA_ENDERECO!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function QueryEnderecoOnly(db: firebird.Database, codend = '', rua = '', edi = '', andar = '', apto = '', dep = ''): Promise<any> {
    return new Promise((resolve, reject) => {
        let sql = '';
        sql = 'SELECT * FROM WMS_ENDERECO END WHERE 1=1 ';
        let params: string[] = [];
        if (codend != '') {
            codend = `${codend}`;
            sql += ' AND MEND.CODENDERECOMER = ?';
            params.push(codend);
        }
        if (rua != '' && edi != '' && andar != '' && apto != '' && dep != ''){
            rua = `${rua}`;
            edi = `${edi}`;
            andar = `${andar}`;
            apto = `${apto}`;
            dep = `${dep}`;
            sql += ' AND WEND.RUA = ? AND WEND.PREDIO = ? AND WEND.NIVEL = ? AND WEND.APTO = ? AND WEND.CODDEPOSITO = ?';
            params.push(rua);
            params.push(edi);
            params.push(andar);
            params.push(apto);
            params.push(dep);
        }
        if (codend == '' && (rua == '' || edi == '' || andar == '' || apto == '' || dep == '')) {
            return reject('Código em branco!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function QueryEndereco(db: firebird.Database, codend = '', rua = '', edi = '', andar = '', apto = '', dep = ''): Promise<any> {
    return new Promise((resolve, reject) => {
        let sql = '';
        sql = 'SELECT wms_endereco.codenderecomer,wms_endereco.rua,wms_endereco.predio,wms_endereco.nivel,wms_endereco.apto, wms_endereco.coddeposito,wms_mercadoria_endereco.id_mercadoria,wms_mercadoria_endereco.quantidade, est_mercadoria.descricao FROM wms_endereco left join wms_mercadoria_endereco on wms_mercadoria_endereco.codenderecomer = wms_endereco.codenderecomer left join est_mercadoria  on est_mercadoria.id_mercadoria = wms_mercadoria_endereco.id_mercadoria where 1=1 '
        //sql = 'SELECT MEND.CODENDERECOMER, MEND.ID_MERCADORIA, MERC.DESCRICAO, MEND.QUANTIDADE, WEND.RUA, WEND.PREDIO, WEND.NIVEL, WEND.APTO, WEND.CODDEPOSITO FROM WMS_MERCADORIA_ENDERECO MEND INNER JOIN EST_MERCADORIA MERC ON MERC.ID_MERCADORIA = MEND.ID_MERCADORIA INNER JOIN WMS_ENDERECO WEND ON WEND.CODENDERECOMER = MEND.CODENDERECOMER WHERE 1=1 ';
        let params: string[] = [];
        if (codend != '') {
            codend = `${codend}`;
            sql += ' AND wms_endereco.CODENDERECOMER = ?';
            params.push(codend);
        }
        if (rua != '' && edi != '' && andar != '' && apto != '' && dep != ''){
            rua = `${rua}`;
            edi = `${edi}`;
            andar = `${andar}`;
            apto = `${apto}`;
            dep = `${dep}`;
            sql += ' AND wms_endereco.RUA = ? AND wms_endereco.PREDIO = ? AND wms_endereco.NIVEL = ? AND wms_endereco.APTO = ? AND wms_endereco.CODDEPOSITO = ?';
            params.push(rua);
            params.push(edi);
            params.push(andar);
            params.push(apto);
            params.push(dep);
        }
        if (codend == '' && (rua == '' || edi == '' || andar == '' || apto == '' || dep == '')) {
            return reject('Código em branco!');
        }
        db.query(sql, params, (err, result) => {
            db.detach(); // Always detach

            if (err) return reject(err);
            resolve(result);
        });
    });
}

function QueryEnderecoInserir(db: firebird.Database, codend = '', id_merc = ''): Promise<any> {
    return new Promise((resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (codend != '') {
            codend = `${codend}`;
            id_merc = `${id_merc}`;
            sql = 'SELECT MEND.CODENDERECOMER, MEND.ID_MERCADORIA, MERC.DESCRICAO, MEND.QUANTIDADE FROM WMS_MERCADORIA_ENDERECO MEND INNER JOIN EST_MERCADORIA MERC ON MERC.ID_MERCADORIA = MEND.ID_MERCADORIA WHERE MEND.CODENDERECOMER = ? AND MEND.ID_MERCADORIA = ?';
            params = [codend, id_merc];
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