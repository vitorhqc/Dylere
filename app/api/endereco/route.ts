import { NextRequest, NextResponse } from "next/server";
import { queryFirebird } from "../firebird";

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
        const enderecoOnly = await QueryEnderecoOnly(codEND, rua, edi, andar, apto, dep)
        return NextResponse.json(enderecoOnly);
    }
    const mercadorias = inserir ? await QueryEnderecoInserir( codEND, codmerc) : await QueryEndereco( codEND, rua, edi, andar, apto, dep);
    return NextResponse.json(mercadorias);
}

export async function POST(Req: NextRequest) {
    const body = await Req.json();
    const codEND = body['codend'] ?? '';
    const codmerc = body['codmerc'] ?? '';
    const quant = body['quant'] ?? '';
    const inserindo = body['insert'] ?? '';
    try {
        const postResult = await PostMercEndereco(codEND, codmerc, quant, inserindo);    
        // ✅ Retorna apenas status 200, sem body
        return new NextResponse(null, { status: 200 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ erro: "Falha ao inserir" }, { status: 400 });
      } 
}

function PostMercEndereco(codend = '', id_merc = '', quant = '', inserir = ''){
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function QueryEnderecoOnly(codend = '', rua = '', edi = '', andar = '', apto = '', dep = ''): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let sql = '';
        sql = 'SELECT * FROM WMS_ENDERECO END WHERE 1=1 ';
        const params: string[] = [];
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function QueryEndereco(codend = '', rua = '', edi = '', andar = '', apto = '', dep = ''): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let sql = '';
        sql = 'SELECT wms_endereco.codenderecomer,wms_endereco.rua,wms_endereco.predio,wms_endereco.nivel,wms_endereco.apto, wms_endereco.coddeposito,wms_mercadoria_endereco.id_mercadoria,wms_mercadoria_endereco.quantidade, est_mercadoria.descricao FROM wms_endereco left join wms_mercadoria_endereco on wms_mercadoria_endereco.codenderecomer = wms_endereco.codenderecomer left join est_mercadoria  on est_mercadoria.id_mercadoria = wms_mercadoria_endereco.id_mercadoria where 1=1 '
        //sql = 'SELECT MEND.CODENDERECOMER, MEND.ID_MERCADORIA, MERC.DESCRICAO, MEND.QUANTIDADE, WEND.RUA, WEND.PREDIO, WEND.NIVEL, WEND.APTO, WEND.CODDEPOSITO FROM WMS_MERCADORIA_ENDERECO MEND INNER JOIN EST_MERCADORIA MERC ON MERC.ID_MERCADORIA = MEND.ID_MERCADORIA INNER JOIN WMS_ENDERECO WEND ON WEND.CODENDERECOMER = MEND.CODENDERECOMER WHERE 1=1 ';
        const params: string[] = [];
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function QueryEnderecoInserir(codend = '', id_merc = ''): Promise<any> {
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}