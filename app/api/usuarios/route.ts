import { NextRequest, NextResponse } from "next/server";
import { queryFirebird } from "../firebird";

export async function GET(Req: NextRequest) {
    const { searchParams } = new URL(Req.url);
    const senha = searchParams.get('senha') ?? '';
    const apelido = searchParams.get('apelido') ?? '';
    const params: [string, string] = [senha, apelido];
    const idUser = await QueryUser(params);
    return NextResponse.json(idUser);
}

function QueryUser([senha = '', apelido = '']): Promise<any> {
    return new Promise(async (resolve, reject) => {
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
        try{
            const dados = await queryFirebird(sql, params);
            resolve(dados);
        }
        catch (err: any){
            reject({ error: err });
        }
    });
}