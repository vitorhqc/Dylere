import { NextRequest, NextResponse } from "next/server";
import { queryFirebird } from "../firebird";

export async function GET(Req: NextRequest) {
   const { searchParams } = new URL(Req.url);
    const idmerc = searchParams.get('id_merc') ?? '';
    const mercadorias = await QueryMercadoria(idmerc);
    return NextResponse.json(mercadorias);
}

export async function PATCH(Req: NextRequest){
    const { searchParams } = new URL(Req.url);
    const codend = searchParams.get('codend') ?? '';
    const idmerc = searchParams.get('idmerc') ?? '';
    const body = await Req.json();
    const quanti = body['quantidade'];
    const result = UpdateQuantidade([codend, idmerc, quanti]);
    return NextResponse.json(result);
}

export async function POST(Req: NextRequest){
    const body = await Req.json();
    const quantFinal = body['quantidade'];
    const quantidade = await PegarQuantidadeTotal([body['codend'], body['idmerc']]);
    const quantidadeTotal = Number(quantFinal) - Number(quantidade[0]['qtesaldo']);
    const datahora = getDataHora();
    const data = datahora[0];
    const hora = datahora[1];
    const wms_idmovimento = await QueryID( ['WMS_MOVIMENTO']);
    const postResult = await InsertWMSMovimentoItem([body['codend'], body['idmerc'], wms_idmovimento[0]['codigo'], body['user'], data, hora, quantidadeTotal.toString()]);
    return new Response(JSON.stringify(postResult), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
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

function InsertWMSMovimentoItem( [codend = '', idmerc = '', wms_movimento = '', user = '', data = '', hora = '', quant = '']): Promise<any>  {
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function PegarQuantidadeTotal( [codend = '', idmerc = '']): Promise<any>  {
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function QueryID([campo = '']): Promise<any>  {
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function UpdateQuantidade([codend = '', idmerc = '', quanti = '']): Promise<any> {
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function QueryMercadoria( id: string): Promise<any>{
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}