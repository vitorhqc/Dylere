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
    const [limiteAtingido, setLimiteAtingido] = useState(0); //0 = Ambos NAO atingidos, 1 = Pagina anterior no limite, 2 = Pagina posterior no limite, 3 = AMBOS no limite;
    Volumes.sort((a, b) => a.codigo.localeCompare(b.codigo));
    const volumePorPagina = 15;
    const quantPaginas = Math.ceil(Volumes.length / volumePorPagina);
    const PaginasVolumes: Volume[][] = [];
    for (let i = 0; i < Volumes.length; i += volumePorPagina) {
        const pagina = Volumes.slice(i, i + volumePorPagina);
        PaginasVolumes.push(pagina);
    }
    
    useEffect(() => {
        
        if (quantPaginas == 1){
            setLimiteAtingido(3);
        }
        else setLimiteAtingido(1);
    },[]);

    useEffect(() => {        
        if (page == 1 && page == quantPaginas){
            setLimiteAtingido(3);
            return;
        }
        if (page == quantPaginas) {
            setLimiteAtingido(2);
            return;
        }
        if (page == 1) {
            setLimiteAtingido(1);
            return;
        }
        setLimiteAtingido(0);
    },[page]);

    function handleNextPage() {
        if (page + 1 > quantPaginas) {
            return;
        }
        setPage(p => p + 1);
    }

    function handlePastPage() {
        if (page - 1 < 1) {
            return;
        }
        setPage(p => p - 1);
    }

    return (
        <div className="fixed inset-0 z-50 bg-stone-300 flex flex-col h-screen w-screen max-w-md mx-auto ">
            <div className="flex flex-col rounded-lg w-full h-full justify-items-center bg-stone-300 p-3 gap-3">
                <ol className="w-full h-full flex flex-col">
                    {PaginasVolumes[page - 1].length > 0 && PaginasVolumes[page - 1].map(v => <li key={v.codigo} className={`flex rounded-lg my-1 w-full 
                    ${(v.status == 'Ok' || v.ok) ? 'bg-green-200' : ((v.status == 'Erro' || (!v.ok && v.status != 'Volume not found')) ? 'bg-red-200' : 'bg-orange-300')}`}>
                        <span className="h-[5%] w-4/5 text-left text-black ml-15 font-bold">Cód: {v.codigo.slice(0,7) + '-' + v.codigo.slice(7)}</span>
                        <span className="h-[5%] w-1/5 text-black font-bold">{v.status == 'Volume not found' ? 'Erro' : (v.ok || v.status == 'Ok' ? 'Ok' : 'Erro')}</span>
                        {(v.status == 'Ok' || v.ok === true) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="green" 
                        className="size-6 my-auto mr-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>}
                        {(v.status == 'Erro' || (v.ok === false && v.status != 'Volume not found')) && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="red" 
                        className="size-6 my-auto mr-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>}
                        {v.status == 'Volume not found' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="darkorange" className="size-6 my-auto mr-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>}
                    </li>)}
                </ol>
                <div className="flex flex-row mx-auto gap-4">
                    <svg xmlns="http://www.w3.org/2000/svg" onClick={() => { handlePastPage() }} fill={`${[1, 3].includes(limiteAtingido) ? 'gray' : 'orange'}`} viewBox="0 0 24 24" strokeWidth={2} stroke={`${[1, 3].includes(limiteAtingido) ? 'gray' : 'orange'}`} className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z" />
                    </svg>
                    <p>Página: {page} de {quantPaginas}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" onClick={() => { handleNextPage() }} fill={`${[2, 3].includes(limiteAtingido) ? 'gray' : 'orange'}`} viewBox="0 0 24 24" strokeWidth={2} stroke={`${[2, 3].includes(limiteAtingido) ? 'gray' : 'orange'}`} className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z" />
                    </svg>
                </div>
            </div>

            <button onClick={close} className="px-3 rounded-xl bg-orange-600 w-30 mx-auto text-white text-sm h-10 mb-2">Fechar</button>
        </div>
    )
};