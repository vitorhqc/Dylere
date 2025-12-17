import { NextRequest, NextResponse } from "next/server";
import { queryFirebird } from "../firebird";

export async function GET(Req: NextRequest) {
   const { searchParams } = new URL(Req.url);
    const placa = searchParams.get('placa') ?? '';
    const volume = searchParams.get('volume') ?? '';
    const novoPedido = searchParams.get('novopedido') ?? '';
    const volCod = searchParams.get('volCod') ?? '';
    const codigos = searchParams.getAll('cod') ?? [];
    if (volCod == '1') {
        const volumes = await QueryAllVolumesFromCod(codigos);
        return NextResponse.json(volumes);
    }
    const volumes = await QueryVolumesFromPlaca(placa, volume, novoPedido);
    return NextResponse.json(volumes);
}

export async function POST(Req: NextRequest){
    const body = await Req.json();
    const volume = body['volume'];
    const placa = body['placa'];
    const coduser = body['coduser'];
    try {
        const updateResult = await updateVolume(placa, volume, coduser);    
        // ✅ Retorna apenas status 201, sem body
        console.log(updateResult);
        if (!updateResult.volume) {
            return NextResponse.json({ error: "Volume não encontrado!!" }, { status: 401 });
        }
        return new NextResponse(null, { status: 201 });
      } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Falha ao inserir" }, { status: 400 });
      }   
}

function QueryVolumesFromPlaca(placa: string, volume = '', novopedido = ''): Promise<any>{
    return new Promise(async (resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (placa != '') {
            placa = `${placa}`;            
            sql = `SELECT TRIM(VOLUME) AS VOLUME FROM WMS_CARREGAMENTO_LOTE WHERE PLACA = ? AND STATUS = 'A' ORDER BY VOLUME`;
            params = [placa];
            if (volume != '' && novopedido != ''){
                volume = `%${volume}%`;
                sql += ' AND VOLUME LIKE ?';
                params = [placa, volume];
            }
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

function QueryAllVolumesFromCod(cod: string[]): Promise<any>{
    return new Promise(async (resolve, reject) => {
        const cods: string[] = [];
        if (cod != null) {
            cod.forEach((c) => {
                cods.push(`VOLUME LIKE '${c}%'`);
            });
        }
        else {
            return reject({error: 'Cod em branco!'});
        }
        let volumeLike = '';
        cods.forEach((c, index) => {
            if (index == cods.length - 1){
                volumeLike = volumeLike + c;
                return;
            }
            volumeLike = volumeLike + c + ' OR ';
        })
        let sql = `SELECT TRIM(VOLUME) AS VOLUME FROM WMS_CARREGAMENTO_LOTE WHERE STATUS = 'A' AND (${volumeLike}) ORDER BY VOLUME`;
        let params: string[] = [];
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function InsertVolume(placa: string, volume: string, coduser: string): Promise<any>{
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}

function updateVolume(placa: string, volume: string, coduser: string): Promise<any>{
    return new Promise(async (resolve, reject) => {
        let sql = '';
        let params: string[] = [];
        if (placa != '' && volume != '' && coduser != '') {
            placa = `${placa}`;
            volume = `${volume}`;
            coduser = `${coduser}`;
            const datahora = getDataHora();
            const data = datahora[0];
            const hora = datahora[1];
            sql = 'UPDATE WMS_CARREGAMENTO_LOTE SET PLACA = ?, DATA = ?, HORA = ?, ID_FUNCIONARIO = ? WHERE VOLUME = ? RETURNING VOLUME';
            params = [placa, data, hora, coduser, volume];
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

function getDataHora(): string[]{
    const agora = new Date().toLocaleString('pt-BR',{
        timeZone: "America/Sao_Paulo",
    });
    
    const data = agora.substring(0,agora.indexOf(',')).trim().replaceAll('/','.');
    const hora = agora.substring(agora.indexOf(',') + 1).trim();
    return [data, hora];
}