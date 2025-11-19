'use client'

import { useState, useEffect } from "react";

type Volume = {
    codigo: string;
    status?: string;
    ok?: boolean;
};

type ListaVolumes = {
    Volumes: Volume[];
    close: () => void;
};

export default function ListaVolumes({ Volumes, close }: ListaVolumes) {

    const [page, setPage] = useState(1);

    const volumePorPagina = 20;
    const quantPaginas = Math.ceil(Volumes.length / volumePorPagina);
    const PaginasVolumes: Volume[][] = [];
    for (let i = 0; i < Volumes.length; i += volumePorPagina) {
        const pagina = Volumes.slice(i, i + volumePorPagina);
        PaginasVolumes.push(pagina);
    }

    function handleNextPage() {
        console.log('NextPage');
        if (page + 1 > quantPaginas) {
            alert('Última página!');
            return;
        }
        setPage(p => p + 1);
    }

    function handlePastPage() {
        console.log('PastPage');
        if (page - 1 < 1) {
            alert('Primeira página!');
            return;
        }
        setPage(p => p - 1);
    }

    return (
        <div className="fixed inset-0 z-50 bg-stone-300 flex flex-col h-svh max-h-svh w-svw max-w-md mx-auto ">
            <div className="flex flex-col rounded-lg w-full h-full justify-items-center bg-stone-300 p-3 gap-3">
                <ol className="w-full h-full flex flex-col">
                    {PaginasVolumes[page - 1].length > 0 && PaginasVolumes[page - 1].map(v => <li key={v.codigo} className={`flex rounded-lg my-1 w-full ${(v.status == 'Ok' || v.ok) ? 'bg-green-200' : ((v.status == 'Erro' || !v.ok) ? 'bg-red-200' : 'bg-white')}`}>
                        <span className="h-[5%] w-4/5 text-left text-black ml-15 font-bold">Cód: {v.codigo.slice(0,6) + '-' + v.codigo.slice(6)}</span>
                        <span className="h-[5%] w-1/5 text-black font-bold">{v.status ?? (v.ok ? 'Ok' : 'Erro')}</span>
                        {(v.status == 'Ok' || v.ok === true) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="green" 
                        className="size-6 my-auto mr-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>}
                        {(v.status == 'Erro' || v.ok === false) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="red" 
                        className="size-6 my-auto mr-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>}
                    </li>)}
                </ol>
                <div className="flex flex-row mx-auto gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" onClick={() => { handlePastPage() }} fill="orange" viewBox="0 0 24 24" strokeWidth={2} stroke="orange" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                    </svg>
                    <p>Página: {page}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" onClick={() => { handleNextPage() }} fill="orange" viewBox="0 0 24 24" strokeWidth={2} stroke="orange" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                    </svg>
                </div>
            </div>

            <button onClick={close} className="px-3 rounded-xl bg-orange-600 w-30 mx-auto text-white text-sm h-10 mb-2">Fechar</button>
        </div>
    )
};