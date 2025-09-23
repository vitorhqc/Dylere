import { useState, useEffect } from "react"
import { json } from "stream/consumers";

type insert = {
    onConfirm: (codmerc: string, quantidade: string, fechar?: boolean) => void;
}

export default function Acerto({onConfirm}: insert) {
    
    const [codmerc, setCodmerc] = useState('');
    const [quantidade,setQuantidade] = useState('');
    const [desc, setDesc] = useState('');
    const [codFiltrado, setCodFiltrado] = useState('');

    /*useEffect(() => {
        return;
    },[desc])*/

    function HandleClick(fechar?: boolean) {
        if (fechar) {
            onConfirm( '', '', fechar);
            return;
        }
        if (!codmerc) {
            alert('Código da mercadoria em branco!');
            return;
        }
        if (!quantidade) {
            alert('Quantidade da mercadoria em branco!');
            return;
        }
        if (Number(quantidade) <= 0) {
            alert('Quantidade da mercadoria menor ou igual a zero!');
            return;
        }
        onConfirm( codmerc, quantidade);
    }

    async function QueryMercadoria(idmer: string) {
        if (idmer == codFiltrado) return;
        const res = await fetch(`/api/mercadorias?id_merc=${encodeURIComponent(idmer)}`,{
            method: 'GET',
        });
        if (!res.ok){
            return;
        }
        const mercadoria = await res.json();
        if (mercadoria.length > 0) {
            setDesc(mercadoria[0].descricao);
        }
        else {
            setDesc('Mercadoria não encontrada!');
        }
        setCodFiltrado(idmer);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full max-w-md justify-items-center">
            <p className="text-lg text-center text-orange-600 min-w-full">{desc ? desc : 'Digite o código da mercadoria:'}</p>
                <input className="rounded-sm border-1 h-10 w-full p-4 text-center" onBlur={() => QueryMercadoria(codmerc)} onChange={(e) => setCodmerc(e.currentTarget.value)}></input>
                <p className="text-lg text-center text-orange-600 min-w-full">Digite a quantidade:</p>
                <input className="rounded-sm border-1 h-10 w-full p-4 text-center" type="number" onChange={(e) => setQuantidade(e.currentTarget.value)}></input>
                <div className="flex w-full items-center justify-center gap-5">
                <button className="w-20 mt-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-300 self-center" onClick={() => HandleClick()}>OK</button>
                <button className="w-20 mt-2 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-300 self-center" onClick={() => HandleClick(true)}>Voltar</button>
                </div>
            </div>
        </div>
    )
}