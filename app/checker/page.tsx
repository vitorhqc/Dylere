'use client';

import { useState, useEffect, useRef, ReactEventHandler } from "react";
import Login from "@/app/components/Login";
import LoginSuccess from "@/app/components/LoginSuccess";
import VolumesItem from "../components/VolumesItem";
import ListaVolumes from "../components/ListaVolumes";
import VolumeRepetido from "../components/VolumeRepetido";
import VeiculoSemVolume from "../components/VeiculoSemVolume";

type Status = 'Erro' | 'Ok' | 'Aguardando...';

type Volume = {
    codigo: string;
    status?: string;
    ok?: boolean;
    difKey?: string;
    changeStatus: (cod: string, newStatus: Status) => void;
};

type Veiculos = {
    placa: string;
    descricao: string;
}

export default function Checker() {

    const scrollRef = useRef<HTMLDivElement>(null);
    const codigoInputRef = useRef<HTMLInputElement>(null);
    const selectInputRef = useRef<HTMLSelectElement>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const placaCaminhaoRef = useRef<HTMLInputElement>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [confirmation, setConfirmation] = useState(false);
    const [volumes, setVolumes] = useState<Volume[]>([]);
    const [usuarioLogado, setUsuarioLogado] = useState('');
    const [loginEfetuado, setLoginEfetuado] = useState(false);
    const [placa, setPlaca] = useState("");
    const [codBarra, setCodBarra] = useState("");
    const [listaVolOpen, setIsListaVolOpen] = useState(false);
    const [volumesFalhos, setVolumesFalhos] = useState<Volume[]>([]);
    const [volumeRepetido, setIsVolumeRepetido] = useState(false);
    const [veiculos, setVeiculos] = useState<Veiculos[]>([]);
    const [veiculoSelecionado, setVeiculoSelecionado] = useState('');
    const [veiculoSemVolume, setVeiculoSemVolume] = useState(false);
    const [key, setKey] = useState(1);
    const [sendFail, setSendFail] = useState(false);

    useEffect(() => {
        console.log(usuarioLogado);
        setLoginEfetuado(true);

        const fetchDados = async () => {
            const dados = await fetch('api/veiculos', {
                method: 'GET',
            })
            if (!dados.ok) {
                alert('Falha ao consultar veiculos!');
                return;
            }
            const data = await dados.json();
            const veiculoss: Veiculos[] = data.map((d: any) => ({
                placa: String(d.placa),
                descricao: String(d.descricao),
            }))
            setVeiculos(veiculoss);
        }
        if (usuarioLogado != '') fetchDados();
    }, [usuarioLogado]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }        
        console.log(volumes);
    },[volumes])

    useEffect(() => {
        if (sendFail){
            const asyncReq = async (cod:string, inc:string) => {
                setVolumes(prev => [...prev, {difKey: IncrementarKey()+inc, codigo: cod, status: 'Aguardando...' , changeStatus: ChangeStatus}])
            };
            console.log(volumesFalhos);
            let i = 1000;
            volumesFalhos.forEach(vol => {
                asyncReq(vol.codigo, String(i));
                i++;
            })
            setSendFail(false);
        }
    },[sendFail])

    function ChangeStatus(cod: string, newStatus: Status){
          setVolumes(prev => prev.map(v =>
            v.codigo === cod ? { ...v, status: newStatus} : v
          ));
    }

    function OptionBtn(){
        setVolumes([]);
        const placaVeiculo = veiculoSelecionado ? veiculoSelecionado : placaCaminhaoRef.current?.value;
        if (placaVeiculo) {
            console.log(placaVeiculo);
            const fetchVolumesPlaca = async () => {
                const dataFetch = await fetch(`api/volumes?placa=${encodeURIComponent(placaVeiculo)}`, {
                    method: 'GET',
                })
                if (!dataFetch.ok) {
                    alert('Falha ao requisitar volumes do veiculo selecionado!!');
                    return;
                }
                const dados = await dataFetch.json();
                console.log(dados);
                if (dados.length == 0) {
                    setVeiculoSemVolume(true);
                    setTimeout(() => {
                        setVeiculoSemVolume(false);
                    }, 1500)
                }
                setVolumes(dados.map((d: any) => ({
                    codigo: d.volume,
                    ok: true,
                })))
            }
            fetchVolumesPlaca();
            return;
        }
        alert("Digite uma placa primeiro!");
    }

    async function FazerLogin(senha: string, apelido: string) {
        try {
            const res = await fetch(`api/usuarios?senha=${encodeURIComponent(senha)}&apelido=${encodeURIComponent(apelido)}`, {
                method: 'GET',
            });
            if (!res.ok) {
                throw new Error('Usuário não encontrado no banco de dados!');
            }
            const result = await res.json();
            if (!result || (Array.isArray(result) && result.length === 0) || (typeof result === 'object' && Object.keys(result).length === 0)) {
                alert('Usuário não encontrado no banco de dados!');
                return;
            }
            setUsuarioLogado(result[0]['id_funcionario']);
        }
        catch (err) {
            throw new Error(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
        }
    }

    function AdicionarVolume(cod: string) {
        const volume = volumes.find(vol => vol.codigo == cod);
        if (volume) {
            if (volume.status != 'Erro') {
                setIsVolumeRepetido(true);
                return;
            }
            setVolumes(prev => prev.filter(v => v != volume));
        }
        setVolumes(prev => [...prev, {difKey: IncrementarKey(), codigo: cod, status: 'Aguardando...' , changeStatus: ChangeStatus}])
    }

    function ConfirmarVolumeBtn() {
        if (veiculoSelecionado == '') {
            alert('Escolha um veiculo!');
            return;
        }
        if (codigoInputRef) {
            if (codigoInputRef.current?.value == '') {
                console.log(codigoInputRef.current?.value);
                alert('Digite um código!')
                return;
            }
            AdicionarVolume(codigoInputRef.current?.value || '');
        }
    }

    function IncrementarKey(): string {
        setKey(p => p + 1);
        const Inckey = String(key) + 'a';
        return Inckey;
    }

    function OptionSelect() {
        if (selectInputRef) setVeiculoSelecionado(selectInputRef.current?.value || '');
    }

    function CloseListaVol(){
        setIsListaVolOpen(false);
    }

    function reenviarFalhos(){
        console.log(volumes);
        setVolumesFalhos([]);
        const volumesss = volumes;
        for (let i = volumesss.length - 1; i >= 0; i--) {
            if (volumesss[i].status == 'Erro') {
              const [removido] = volumesss.splice(i, 1); // remove do original
              setVolumesFalhos(p => [...p, removido]); // adiciona no outro
            }
        }
        setVolumes(volumesss);
        setSendFail(true);
    }

    /*<select onChange={OptionSelect} ref={selectInputRef} className={`placeholder-gray-600 ${placa == "" ? '' : 'uppercase'}  text-center bg-[#cbd0d2] text-black p-1 rounded-sm border-1 m-1 border-orange-600 w-full`}>
                            <option value='' >Selecione o veiculo</option>
                            {veiculos.length > 0 && veiculos.map(v => (<option value={v.placa} key={v.placa}>{v.placa} - {v.descricao}</option>))}
                        </select>*/

    return (
        <div className="relative h-svh max-h-svh w-svw max-w-md mx-auto bg-orange-200">
            {loginEfetuado && <LoginSuccess ID={usuarioLogado} customClass="absolute top-4 right-3 z-50 flex items-center justify-center bg-black/0 w-20"></LoginSuccess>}
            {usuarioLogado == '' && <Login onConfirm={FazerLogin}></Login>}
            {veiculoSemVolume && <VeiculoSemVolume></VeiculoSemVolume>}
            {listaVolOpen && <ListaVolumes close={CloseListaVol} Volumes={volumes}></ListaVolumes>}
            {volumeRepetido && <VolumeRepetido OKBtn={() => { setIsVolumeRepetido(false) }}></VolumeRepetido>}
            <main className="flex flex-col h-full w-full justify-items-center items-stretch bg-[#1c2c2c] text-white">
                <div className="mt-1 flex flex-col justify-start">
                    <div className="flex flex-row w-[80%] items-center text-center my-1 ml-1">
                        <label className="text-sm">Placa do caminhão:</label>
                        <input ref={placaCaminhaoRef} onInput={(e) => {e.currentTarget.value = e.currentTarget.value.toLocaleUpperCase()}}
                        className={`placeholder-gray-600 ${isReadOnly ? 'italic' : 'not-italic'} text-center uppercase bg-[#cbd0d2] text-black p-1 rounded-sm border-1 m-1 border-orange-600 max-w-full w-full`}>
                        </input>
                        <button onClick={OptionBtn} className=" px-3 rounded-xl bg-orange-600 text-white text-sm h-10 mr-2">Confirmar</button>
                    </div>
                    <div className="flex flex-row w-full items-center text-center my-1">
                        <label className="text-sm">Código de barra:</label>
                        <input type="text"
                            inputMode="numeric"
                            pattern="-?[0-9]*" 
                            ref={codigoInputRef} placeholder="Digite ou leia o código de barras" readOnly={isReadOnly} onClick={() => { }}
                            className={`placeholder-gray-600 ${isReadOnly ? 'italic' : 'not-italic'} text-center bg-[#cbd0d2] text-black p-1 rounded-sm border-1 m-1 border-orange-600 max-w-full w-full`}
                            onChange={(e) => {if (e.currentTarget.value.length == 10) ConfirmarVolumeBtn(); }}>
                        </input>
                        <button onClick={ConfirmarVolumeBtn} className=" px-3 rounded-xl bg-orange-600 text-white text-sm h-10 mr-2">Confirmar</button>
                    </div>
                </div>
                <div ref={scrollRef} className="flex-1 max-w-full p-1 relative overflow-auto rounded-sm border-1 mx-2 border-orange-600 bg-[#cbd0d2]">
                    {(volumes.length > 0) &&
                        <ol className="">
                            {volumes.length > 0 && volumes.map(v => <VolumesItem changeStatus={ChangeStatus} key={v.difKey ? v.difKey : v.codigo} 
                            placa={veiculoSelecionado} usuarioLogado={usuarioLogado} codbarra={v.codigo} Ok={v.ok || false}></VolumesItem>)}
                        </ol>}
                </div>
                <div className="flex flex-row w-full p-2">
                    <button onClick={() => {setIsListaVolOpen(true)}} className="px-3 rounded-xl bg-orange-600 w-30 mx-auto text-white text-sm h-10">Listar Volumes</button>
                    <button onClick={() => {reenviarFalhos()}} className="px-3 rounded-xl bg-orange-600 w-30 mx-auto text-white text-sm h-10">Reenviar volumes falhos</button>
                </div>
            </main>
        </div>
    );
}
