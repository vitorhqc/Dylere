import { NextRequest, NextResponse } from "next/server";
import { queryFirebird } from "../firebird";

export async function GET(Req: NextRequest) {
   const { searchParams } = new URL(Req.url);
    const placa = searchParams.get('placa') ?? '';
    const data = await QueryVeiculo(placa);
    return NextResponse.json(data);
}


function QueryVeiculo( placa: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
        let sql = "";
        sql = `SELECT PLACA FROM WMS_PLACA WHERE STATUS LIKE 'A'`;
        let params: string[] = [];
        params = [];
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}