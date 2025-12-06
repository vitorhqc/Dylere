'use client';

import { useState, useEffect, useRef, ReactEventHandler } from "react";
import Login from "@/app/components/Login";
import LoginSuccess from "@/app/components/LoginSuccess";
import VolumesItem from "../components/VolumesItem";
import ListaVolumes from "../components/ListaVolumes";
import VolumeRepetido from "../components/VolumeRepetido";
import VeiculoSemVolume from "../components/VeiculoSemVolume";
import { SegmentBoundaryTriggerNode } from "next/dist/next-devtools/userspace/app/segment-explorer-node";

type Status = 'Erro' | 'Ok' | 'Aguardando...' | 'Volume not found';

type Volume = {
    codigo: string;
    codpedido?: string;
    status?: string;
    ok?: boolean;
    difKey?: string;
    changeStatus: (cod: string, newStatus: Status) => void;
};

type Veiculos = {
    placa: string;
}

export default function Checker() {

    const scrollRef = useRef<HTMLDivElement>(null);
    const codigoInputRef = useRef<HTMLInputElement>(null);
    const selectInputRef = useRef<HTMLSelectElement>(null);
    const selectPedidoRef = useRef<HTMLSelectElement>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const placaCaminhaoRef = useRef<HTMLInputElement>(null);
    const [pedidoSelecionado, setPedidoSelecionado] = useState('');
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [btnDisabled, setBtnDisabled] = useState(true);
    const [confirmation, setConfirmation] = useState(false);
    const [volumes, setVolumes] = useState<Volume[]>([]);
    const [volumesexibidos, setVolumesexibidos] = useState<Volume[]>([]);
    const [usuarioLogado, setUsuarioLogado] = useState('');
    const [loginEfetuado, setLoginEfetuado] = useState(false);
    const [novoPedido, setnovoPedido] = useState("");
    const [codBarra, setCodBarra] = useState("");
    const [listaVolOpen, setIsListaVolOpen] = useState(false);
    const [volumesFalhos, setVolumesFalhos] = useState<Volume[]>([]);
    const [volumeRepetido, setIsVolumeRepetido] = useState(false);
    const [veiculos, setVeiculos] = useState<Veiculos[]>([]);
    const [veiculoSelecionado, setVeiculoSelecionado] = useState('');
    const [veiculoSemVolume, setVeiculoSemVolume] = useState(false);
    const [key, setKey] = useState(1);
    const [sendFail, setSendFail] = useState(false);
    const [pedidos, setPedidos] = useState<any[]>([]);
    const [quantVolumes, setQuantVolumes] = useState(0);

    useEffect(() => {
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
            }))
            setVeiculos(veiculoss);
        }
        if (usuarioLogado != '') fetchDados();
    }, [usuarioLogado]);

    useEffect(() => {
        setPedidoSelecionado('');
        if (veiculoSelecionado != 'Selecione a placa' && veiculoSelecionado != ''){
            fetchVolumesPlaca(veiculoSelecionado);
            setBtnDisabled(false);
            codigoInputRef.current?.focus()
            return;
        }
        setBtnDisabled(true);
    },[veiculoSelecionado]);

    useEffect(() => {
        if (pedidoSelecionado == '' || pedidoSelecionado == 'all') {
            setVolumesexibidos(volumes);
            return;
        }
        setVolumesexibidos(volumes.filter((vol) => vol.codpedido == pedidoSelecionado));
    },[pedidoSelecionado])

    useEffect(() => {
        if (pedidoSelecionado == '' || pedidoSelecionado == 'all') setVolumesexibidos(volumes);
        else setVolumesexibidos(volumes.filter(v => v.codpedido == pedidoSelecionado));
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        setQuantVolumes(volumes.length);
        if (volumes.length - quantVolumes != 1) {
            let pedidoss: any[] = [];
            volumes.forEach(vol => {
                let codpedido = vol.codigo.substring(0, 7);
                if (!pedidoss.includes(codpedido)) {
                    pedidoss.push(codpedido);
                }
            });
            setPedidos(pedidoss);
            return;
        }
        if (!pedidos.includes(volumes[volumes.length - 1].codigo.substring(0,7))){
            setPedidos((p) => [...p, volumes[volumes.length - 1].codigo.substring(0,7)]);
        }
    }, [volumes])

    useEffect(() => {
        if (sendFail) {
            const asyncReq = async (cod: string, inc: string) => {
                setVolumes(prev => [...prev, { difKey: IncrementarKey() + inc, codigo: cod, status: 'Aguardando...', changeStatus: ChangeStatus }])
            };
            console.log(volumesFalhos);
            let i = 1000;
            volumesFalhos.forEach(vol => {
                asyncReq(vol.codigo, String(i));
                i++;
            })
            setSendFail(false);
        }
    }, [sendFail])

    function ChangeStatus(cod: string, newStatus: Status) {
        setVolumes(prev => prev.map(v =>
            v.codigo === cod ? { ...v, status: newStatus } : v
        ));
    }

    async function fetchVolumesPlaca(placa = '', volume = '', novopedido = '') {
        const placaVeiculo = placaCaminhaoRef.current?.value ?? '';
        let fetchUrl = `api/volumes?placa=${encodeURIComponent(placa)}`;
        if (volume != '' && novopedido != '') {
            fetchUrl = `api/volumes?placa=${encodeURIComponent(placa)}&volume=${encodeURIComponent(volume)}&novopedido=${encodeURIComponent(novopedido)}`;
        }
        const dataFetch = await fetch(fetchUrl, {
            method: 'GET',
        })
        if (!dataFetch.ok) {
            alert('Falha ao requisitar volumes do veiculo selecionado!!');
            setVeiculoSelecionado('');
            return;
        }
        const dados = await dataFetch.json();
        if (dados.length == 0) {
            setVeiculoSemVolume(true);
            setTimeout(() => {
                setVeiculoSemVolume(false);
            }, 1500)
        }
        setPedidos([]);
        setVolumes(dados.map((d: any) => ({
            codigo: d.volume,
            codpedido: d.volume.substring(0,7),
            ok: true,
        })))
    }

    function OptionBtn() {
        if (codigoInputRef.current) codigoInputRef.current.value = '';
        setPedidoSelecionado('');
        setBtnDisabled(false);
        setVolumes([]);
        if (placaCaminhaoRef.current) setVeiculoSelecionado(placaCaminhaoRef.current.value);
        const placaVeiculo = placaCaminhaoRef.current?.value ?? null;
        if (placaVeiculo) {
            fetchVolumesPlaca();
            return;
        }
        setVeiculoSelecionado('');
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

    function AdicionarVolume(cod: string, codped: string) {
        const volume = volumes.find(vol => vol.codigo == cod);
        if (volume) {
            if (volume.status != 'Erro') {
                setIsVolumeRepetido(true);
                return;
            }
            setVolumes(prev => prev.filter(v => v != volume));
        }
        setVolumes(prev => [...prev, { difKey: IncrementarKey(), codpedido: codped, codigo: cod, status: 'Aguardando...', changeStatus: ChangeStatus }])
    }

    function ConfirmarVolumeBtn() {
        if (veiculoSelecionado == '' || veiculoSelecionado == 'Selecione a placa') {
            alert('Escolha um veiculo!');
            return;
        }
        if (codigoInputRef.current) {
            if (codigoInputRef.current.value == '') {
                alert('Digite um código!');
                return;
            }
            const codEtq = codigoInputRef.current.value;
            codigoInputRef.current.value = "";            
            AdicionarVolume(codEtq || '', codEtq.substring(0,7));
            setPedidoSelecionado(codEtq.substring(0,7));
        }
    }

    function verificarNovoPedido(codVol: string) {
        if (codVol.substring(0, 7) != volumes[volumes.length - 1].codigo.substring(0, 7)) {
            //fetchVolumesPlaca(codVol.substring(0, 7), 'true');
            //setnovoPedido(codVol);
            return;
        }
        AdicionarVolume(codVol || '', volumes[volumes.length - 1].codpedido ?? '');
    }

    function IncrementarKey(): string {
        setKey(p => p + 1);
        const Inckey = String(key) + 'a';
        return Inckey;
    }

    function OptionSelect() {
        if (selectInputRef) setVeiculoSelecionado(selectInputRef.current?.value || '');
    }

    function CloseListaVol() {
        setIsListaVolOpen(false);
    }

    function reenviarFalhos() {
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

    function verificarPlacaBtn() {
        if (veiculoSelecionado == '' || veiculoSelecionado != placaCaminhaoRef.current?.value) {
            setBtnDisabled(true);
            return;
        }
        setBtnDisabled(false);
    }

    function getPedidos() {

    }

    function onSelectPedidoChange() {

    }

    return (
        <div className="relative h-[90vh] max-h-[90vh] w-screen max-w-md mx-auto bg-orange-200">
            {loginEfetuado && <LoginSuccess ID={usuarioLogado} customClass="absolute top-4 right-3 z-50 flex items-center justify-center bg-black/0 w-20"></LoginSuccess>}
            {usuarioLogado == '' && <Login onConfirm={FazerLogin}></Login>}
            {veiculoSemVolume && <VeiculoSemVolume></VeiculoSemVolume>}
            {listaVolOpen && <ListaVolumes close={CloseListaVol} Volumes={volumesexibidos}></ListaVolumes>}
            {volumeRepetido && <VolumeRepetido OKBtn={() => { setIsVolumeRepetido(false) }}></VolumeRepetido>}
            <main className="flex flex-col h-full w-full justify-items-center items-stretch bg-[#1c2c2c] text-white">
                <div className="mt-1 flex flex-col justify-start">
                    <div className="flex flex-row w-[80%] items-center text-center my-1 ml-1 gap-2">
                        <label className="text-sm">Placa do caminhão:</label>
                        <select className="bg-[#cbd0d2] text-black rounded-sm border border-orange-600 gap-2" value={veiculoSelecionado} onChange={(s) => {setVeiculoSelecionado(s.currentTarget.value);}}>
                        <option className="text-black" value={'Selecione a placa'}>Selecione a placa</option>
                            {veiculos.length > 0 && veiculos.map((veic) => <option className="text-black" key={veic.placa}>{veic.placa}</option>)}
                        </select>
                       { /*<input ref={placaCaminhaoRef} onInput={(e) => { e.currentTarget.value = e.currentTarget.value.toLocaleUpperCase(); console.log(placaCaminhaoRef.current?.value + '-' + veiculoSelecionado); verificarPlacaBtn(); }}
                            className={`placeholder-gray-600 ${isReadOnly ? 'italic' : 'not-italic'} text-center uppercase bg-[#cbd0d2] text-black p-1 rounded-sm border-1 m-1 border-orange-600 max-w-full w-full`}>
                        </input>*/}
                        {/*<button onClick={() => { OptionBtn(); codigoInputRef.current?.focus(); }} className=" px-3 rounded-xl bg-orange-600 text-white text-sm h-10 mr-2">Confirmar</button>*/}
                    </div>
                    <div className="flex flex-row w-full items-center text-center my-1">
                        <label className="text-sm">Código de barra:</label>
                        <input type="text"
                            onClick={() => {if (btnDisabled) alert('Selecione uma placa!!')}}
                            inputMode="numeric"
                            pattern="-?[0-9]*"
                            ref={codigoInputRef} placeholder="Digite ou leia o código de barras" readOnly={btnDisabled} 
                            className={`placeholder-gray-600 ${btnDisabled ? 'italic' : 'not-italic'} text-center bg-[#cbd0d2] text-black p-1 rounded-sm border-1 m-1 border-orange-600 max-w-full w-full`}
                            onChange={(e) => { if (e.currentTarget.value.length == 10) { ConfirmarVolumeBtn(); codigoInputRef.current?.focus(); } }}>
                        </input>
                        <button disabled={btnDisabled} onClick={ConfirmarVolumeBtn} className={`px-3 rounded-xl bg-orange-600 text-white text-sm h-10 mr-2 disabled:bg-gray-400 disabled:cursor-not-allowed`}>Confirmar</button>
                    </div>
                    <div className="flex flex-row w-full justify-center items-center text-center my-1 gap-2">
                        <label className="text-md">Número do Pedido:</label>
                        <select className="bg-[#cbd0d2] text-black rounded-sm border border-orange-600" value={pedidoSelecionado} onChange={(s) => {setPedidoSelecionado(s.currentTarget.value);}}>
                            <option className="text-black" value={'all'}>Todos</option>
                            {pedidos.length > 0 && pedidos.map((ped) => <option className="text-black" key={ped}>{ped}</option>)}
                        </select>
                    </div>
                </div>
                <div ref={scrollRef} className="flex-1 max-w-full p-1 relative overflow-auto rounded-sm border-1 mx-2 border-orange-600 bg-[#cbd0d2]">
                    {(volumesexibidos.length > 0) &&
                        <ol className="">
                            {volumesexibidos.length > 0 && volumesexibidos.map(v => <VolumesItem changeStatus={ChangeStatus} key={v.difKey ? v.difKey : v.codigo}
                                placa={veiculoSelecionado} usuarioLogado={usuarioLogado} codbarra={v.codigo} Ok={v.ok || v.status == 'Ok' ? true : false}></VolumesItem>)}
                        </ol>}
                </div>
                <div className="flex flex-row w-full p-2">
                    <button onClick={() => { setIsListaVolOpen(true) }} className="px-3 rounded-xl bg-orange-600 w-30 mx-auto text-white text-sm h-10">Listar Volumes</button>
                    <button onClick={() => { reenviarFalhos() }} className="px-3 rounded-xl bg-orange-600 w-30 mx-auto text-white text-sm h-10">Reenviar volumes falhos</button>
                </div>
            </main>
        </div>
    );
}
