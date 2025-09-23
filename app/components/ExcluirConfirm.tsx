import { useState } from "react"

type excluir = {
    nomeMerc: string;
    onConfirm: (confirmar: boolean) => void;
}

export default function ExcluirConfirm({nomeMerc, onConfirm}: excluir) {

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full max-w-md justify-items-center mx-2">
                <p className="text-lg text-center text-orange-600 min-w-full">Confirmar a exclusão da mercadoria: {nomeMerc} deste endereço?</p>
                <div className="flex w-full items-center justify-center gap-5">
                <button className="w-20 mt-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-300 self-center" onClick={() => onConfirm(true)}>Sim</button>
                <button className="w-20 mt-2 px-4 py-1 rounded bg-red-500 text-white hover:bg-red-300 self-center" onClick={() => onConfirm(false)}>Não</button>
                </div>
            </div>
        </div>
    )
}