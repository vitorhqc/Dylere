'use client'

import { useState, useEffect, useRef } from "react"
import VolItemTooltip from "./VolItemTooltip";

type Status = 'Erro' | 'Ok' | 'Aguardando...';

type Volumes = {
    codbarra: string;
}

type VolumesItemProps = {
    placa: string;
    usuarioLogado: string;
    changeStatus: (cod: string, newStatus: Status) => void;
    Ok?: boolean;
} & Volumes;

export default function VolumesItem({ placa, usuarioLogado, Ok, codbarra, changeStatus }: VolumesItemProps) {

    const [isOk, setIsOk] = useState(Ok || false);
    const [isErro, setIsErro] = useState(false);
    const [stat, setStat] = useState<Status>('Aguardando...');
    const jaExecutou = useRef(false);
    const [mouseOnItem, setMouseOnItem] = useState(false);
    const codHifen = codbarra.slice(0,6) + '-' + codbarra.slice(6);

    useEffect(() => {
        postVolume();
    }, [])

    function postVolume(){
        if (jaExecutou.current || isOk) {
            if (isOk) {
                changeStatus(codbarra, 'Ok');
                setStat('Ok');
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
                changeStatus(codbarra, 'Erro');
                setStat('Erro');
                ConferirUnico();
                return;
            }
            changeStatus(codbarra, 'Ok');
            setStat('Ok');
        }
        fetchInsertVolume();
    }

    async function ConferirUnico(){
        const data = await fetch (`api/volumes?placa=${encodeURIComponent(placa)}&volume=${encodeURIComponent(codbarra)}`,{
            method: 'GET',
        });
        if (!data.ok){
            return;
        }
        const vol = await data.json();
        if (vol.length > 0){
            changeStatus(codbarra, 'Ok');
            setStat('Ok');
        }
    }

    return (
        <li className="relative max-w-full p-1">
            <div className={`static flex group flex-row rounded-lg w-full h-12 justify-items-center ${stat == 'Ok' ? 'bg-green-200' : (stat == 'Erro' ? 'bg-red-200' : '')}`}>
                <span className={`text-black font-bold mx-auto my-auto w-[75%] text-left ml-7`}>Cód: {codHifen}</span>
                <span className="text-black mx-auto my-auto w-[25%]"> Status: {stat}</span>
                {stat == 'Ok' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="green" className="size-6 my-auto mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>}
                {stat == 'Erro' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="red" className="size-6 my-auto mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                }
            </div>
        </li>
    )
}