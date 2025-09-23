import { useState } from "react"

type acerto = {
    onConfirm: (codmerc: string, quantidade: string, fechar?: boolean) => void;
}

export default function Acerto({onConfirm}: acerto) {

    const [quantidade,setQuantidade] = useState('');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full max-w-md justify-items-center">
                <p className="text-lg text-center text-orange-600 min-w-full">Digite a quantidade:</p>
                <input className="rounded-sm border-1 h-10 w-full p-4 text-center" type="number" onChange={(e) => setQuantidade(e.currentTarget.value)}></input>
                <div className="flex w-full items-center justify-center gap-5">
                <button className="w-20 mt-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-300 self-center" onClick={() => onConfirm('', quantidade)}>OK</button>
                <button className="w-20 mt-2 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-300 self-center" onClick={() => onConfirm('', '', true)}>Voltar</button>
                </div>                
            </div>
        </div>
    )
}