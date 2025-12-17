'use client'

import { useState, useEffect, useRef } from "react"
import VolItemTooltip from "./VolItemTooltip";

type Status = 'Erro' | 'Ok' | 'Aguardando...' | 'Volume not found';

type Volumes = {
    codbarra: string;
}

type VolumesItemProps = {
    placa: string;
    usuarioLogado: string;
    changeStatus: (cod: string, newStatus: Status) => void;
    status? : Status;
    Ok?: boolean;
    lido?: boolean;
} & Volumes;

export default function VolumesItem({ placa, usuarioLogado, Ok, codbarra, changeStatus, lido, status }: VolumesItemProps) {

    const [isOk, setIsOk] = useState(Ok || false);
    const [isErro, setIsErro] = useState(false);
    const [error, setError] = useState('');
    const [stat, setStat] = useState<Status>(status ? status : 'Aguardando...');
    const jaExecutou = useRef(false);
    const [mouseOnItem, setMouseOnItem] = useState(false);
    const codHifen = codbarra.slice(0, 7) + '-' + codbarra.slice(7);

    useEffect(() => {
        postVolume();
    }, [])

    function postVolume() {
        if (status != 'Aguardando...') return;
        if (jaExecutou.current || isOk) {
            if (isOk) {
                setStat('Ok');
                return;
                //changeStatus(codbarra, 'Ok');
                
            }
            return;
        };
        jaExecutou.current = true;
        const fetchInsertVolume = async () => {
            const result = await fetch(`api/volumes`, {
                method: 'POST',
                body: JSON.stringify({ placa: placa, volume: codbarra, coduser: usuarioLogado }),
            })
            if (!result.ok || result.status != 201) {
                if (result.status == 401) {
                    changeStatus(codbarra, 'Volume not found');
                    const erro = (await result.json()).error;
                    setError(erro || '');
                    console.log(erro);
                    setStat('Volume not found');
                    return;
                }
                changeStatus(codbarra, 'Erro');
                setError((await result.json()).error || '');
                setStat('Erro');
                ConferirUnico();
                return;
            }
            changeStatus(codbarra, 'Ok');
            setStat('Ok');
        }
        fetchInsertVolume();
    }

    async function ConferirUnico() {
        const data = await fetch(`api/volumes?placa=${encodeURIComponent(placa)}&volume=${encodeURIComponent(codbarra)}`, {
            method: 'GET',
        });
        if (!data.ok) {
            return;
        }
        const vol = await data.json();
        if (vol.length > 0) {
            changeStatus(codbarra, 'Ok');
            setStat('Ok');
        }
    }

    function handleStatusClick() {
        if (error) alert(error);
    }

    return (
        <li className="relative max-w-full p-1">
            <div className={`static flex group flex-row rounded-lg w-full h-12 justify-items-center 
            ${(stat == 'Ok') && 'bg-green-200'} 
            ${(stat == 'Erro') && 'bg-red-200'}
            ${((stat == 'Volume not found') && 'bg-orange-300')}`}>
                <span className={`text-black font-bold mx-auto my-auto w-[75%] text-left ml-7`}>Cód: {codHifen}</span>
                <span className="text-black mx-auto my-auto text-nowrap max-w-[45%] mr-3" onClick={handleStatusClick}> Status: {stat == 'Volume not found' ? 'Não lido' : stat}</span>
                {stat == 'Ok' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="green" className="size-6 my-auto mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>}
                {stat == 'Erro' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="red" className="size-6 my-auto mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>}
                {stat == 'Volume not found' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="darkorange" className="size-6 my-auto mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>}
            </div>
        </li>
    )
}