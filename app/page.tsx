'use client';

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import CodigoSucess from "./components/CodigoSuccess";
import Acerto from "./components/Acerto";
import AcertoSuccess from "./components/AcertoSuccess";
import Login from "./components/Login";
import LoginSuccess from "./components/LoginSuccess";
import SemMercadoria from "./components/SemMercadoria";
import Inserir from "./components/Inserir";
import InserirSuccess from "./components/InserirOK";
import ExcluirConfirm from "./components/ExcluirConfirm";
import FiltrandoInfos from "./components/FiltrandoInfo";

const Leitor = dynamic(() => import('@/app/components/Leitor'), {
  ssr: false,
});

export default function Home() {

  const codigoInputRef = useRef<HTMLInputElement>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [endereco, setEndereco] = useState({ rua: '', edi: '', andar: '', apto: '', dep: '' });
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [leitorativo, setLeitorativo] = useState(false);
  const [codigoEnd, setCodigoend] = useState('');
  const [codigoLido, setCodigoLido] = useState(false);
  const [codigoLeitor, setCodigoleitor] = useState('');
  const [confirmation, setConfirmation] = useState(false);
  const [mercadorias, setMercadorias] = useState<any[]>([]);
  const [mercadoriaSelecionada, setMercadoriaSelecionada] = useState<string[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState('');
  const [isAcertando, setIsacertando] = useState(false);
  const [acertook, setAcertook] = useState(false);
  const [inserirok, setInserirok] = useState(false);
  const [loginEfetuado, setLoginEfetuado] = useState(false);
  const [isInserindo, setIsInserindo] = useState(false);
  const [isExcluindo, setIsExcluindo] = useState(false);
  const [depAceitaInserir, setdepAceitaInserir] = useState(true);
  const [isFiltrando, setIsFiltrando] = useState(false);

  useEffect(() => {
    if (codigoLido){
      if (codigoInputRef.current) {
        codigoInputRef.current.value = codigoLeitor;
        setCodigoend(codigoLeitor);
        setCodigoLido(false);
        FiltrarEndereco(codigoLeitor, {rua: '', edi: '', andar: '', apto: '', dep: '' });
        if (codigoLeitor != '') HandleConfirmationModal();
      }
    }
  }, [codigoLido])

  useEffect(() => {
    console.log(usuarioLogado);
    setLoginEfetuado(true);
    /*setTimeout(() => {
      setLoginEfetuado(false);
    }, 1500);*/
  }, [usuarioLogado])

  function HandleConfirmationModal() {
    setConfirmation(true);

    setTimeout(() => {
      setConfirmation(false);
    }, 1500)
  }

  /*async function PostMercEndereco(codmerc = '', quant: string) {    
    try {
      if (isInserindo) {
        const mercsFetch = await fetch(`/api/endereco?codend=${encodeURIComponent(codigoEnd)}&codmerc=${encodeURIComponent(codmerc)}&inserir=true`, {
          method: 'GET'
        });
        const mercs = await mercsFetch.json();
        if (mercs.length > 0) {
          setMercadoriaSelecionada([codmerc, codigoEnd])
        }
        else {
          const post = await fetch()
        }
      }
    }
    catch (err) {
      throw new Error(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    setIsacertando(false);
  }*/

  async function AcertarQuant(codmerc = '', quant: string, fechar?: boolean) {
    if (fechar) {
      setIsInserindo(false);
      setIsacertando(false);
      return;
    }
    try {
      if (isInserindo) {
        setIsInserindo(false);
        setIsFiltrando(true);
        const mercsFetch = await fetch(`/api/endereco?codend=${encodeURIComponent(codigoEnd)}&codmerc=${encodeURIComponent(codmerc)}&inserir=true`, {
          method: 'GET'
        });
        const mercs = await mercsFetch.json();
        if (mercs.length == 0) {
          const postMerc = await fetch(`/api/endereco`, {
            method: 'POST',
            body: JSON.stringify({ codend: codigoEnd, codmerc: codmerc, quant: quant , insert: true})
          });
          if (postMerc.status != 200) {
            console.log('Erro ao inserir mercadoria!')
            alert('Erro ao inserir mercadoria! Verifique o código da mercadoria e tente novamente!')
          }
          if (!postMerc.ok) {
            throw new Error(`Falha ao inserir mercadoria!`);
          }

          const dataPost = await postMerc.status;
          console.log(dataPost);
          setIsInserindo(false);
          setIsFiltrando(false);
          setInserirok(true);
          setTimeout(() => {
            setInserirok(false);
          }, 1500)
        }
      }
      setIsacertando(false);
      setIsFiltrando(true);
      codmerc = codmerc ? codmerc : mercadoriaSelecionada[0];
      const res = await fetch(`/api/mercadorias?codend=${encodeURIComponent(codigoEnd)}&idmerc=${encodeURIComponent(codmerc)}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantidade: quant })
      });
      if (!res.ok) {
        throw new Error(`Falha ao acertar quantidade!`);
      }
      const data = await res.status;
      console.log(data);
      if (data == 200) {
        setAcertook(true);
        setIsFiltrando(false);
        setTimeout(() => {
          setAcertook(false);
        }, 1500)
      }
      isInserindo ? await PostQuant(quant, codigoEnd, codmerc) : await PostQuant(quant);
      setIsInserindo(false);
    }
    catch (err) {
      throw new Error(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
    setIsacertando(false);
  }

  function mudarCodigo(codigo: string) {
    LimparInputs(true);
    setCodigoleitor(codigo);
    setCodigoLido(true);
  }

  function desativarLeitor() {
    setLeitorativo(false);
  }

  async function PostQuant(quant: string, codigoend?: string, idmerc?: string) {
    try {
      setIsFiltrando(true);
      const res = await fetch(`/api/mercadorias`, {
        method: 'POST',
        body: JSON.stringify({ codend: codigoend ? codigoend : mercadoriaSelecionada[1], idmerc: idmerc ? idmerc : mercadoriaSelecionada[0], quantidade: quant, user: usuarioLogado })
      });
      if (res.status != 200) {
        throw new Error(`Falha ao lançar informação na tabela de movimento!`);
      }
      const data = await res.status;
      console.log(data);
      FiltrarEndereco(codigoend ? codigoend : mercadoriaSelecionada[1]);
    }
    catch (err) {
      //Vai vercel
      FiltrarEndereco(codigoend ? codigoend : mercadoriaSelecionada[1]);
      throw new Error(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  function HandleListItemClick(e: React.MouseEvent<HTMLLIElement>) {
    const idMerc = e.currentTarget.getAttribute('data-id') ?? '';
    const codEnder = e.currentTarget.getAttribute('data-codend') ?? '';
    const descMerc = e.currentTarget.getAttribute('data-desc') ?? '';
    setMercadoriaSelecionada([idMerc, codEnder, descMerc]);
  }

  function HandleLerCodigoButton() {
    LimparInputs(false);
    leitorativo ? setLeitorativo(false) : setLeitorativo(true);
    setMercadorias([]);
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

  function SemMercadorias() {
    setMercadorias([0]);
    setTimeout(() => {
      setMercadorias([-1]);
    }, 1500)
  }

  async function HandleExcluir(confirmar: boolean) {    
    setIsExcluindo(false);
    if (confirmar) {
      const res = await fetch(`/api/mercadorias?codend=${encodeURIComponent(mercadoriaSelecionada[1])}&idmerc=${encodeURIComponent(mercadoriaSelecionada[0])}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantidade: '0' })
      });
      if (!res.ok) {
        alert('Falha ao excluir mercadoria!');
        
    setIsExcluindo(false);
        throw new Error(`Falha ao excluir mercadoria!`);
      }
      const data = await res.status;
      console.log(data);
      if (data == 200) {
        setAcertook(true);
        setTimeout(() => {
          setAcertook(false);
        }, 1500)
        FiltrarEndereco(mercadoriaSelecionada[1]);
      }
      await PostQuant('0', mercadoriaSelecionada[1], mercadoriaSelecionada[0]);
    }
  }

  async function FiltrarEndereco(endcode = '', { rua = undefined, edi = undefined, andar = undefined, apto = undefined, dep = undefined }: { rua?: string; edi?: string; andar?: string; apto?: string; dep?: string; } = {}) {
    try {
      setIsFiltrando(true);
      setMercadoriaSelecionada([]);
      const codigo = endcode || codigoEnd;
      const prua = rua !== undefined ? rua : endereco.rua;
      const pedi = edi !== undefined ? edi : endereco.edi;
      const pandar = andar !== undefined ? andar : endereco.andar;
      const papto = apto !== undefined ? apto : endereco.apto;
      const pdep = dep !== undefined ? dep : endereco.dep;
      const res = await fetch(`/api/endereco?codend=${encodeURIComponent(codigo)}&rua=${encodeURIComponent(prua)}&edi=${encodeURIComponent(pedi)}&andar=${encodeURIComponent(pandar)}&apto=${encodeURIComponent(papto)}&dep=${encodeURIComponent(pdep)}`, {
        method: 'GET',
      });
      if (!res.ok) {
        setIsFiltrando(false);
        alert('Endereço não encontrado!');
        return;
      }
      const data = await res.json();
      console.log(data);
      if (data.length == 0) {
        setIsFiltrando(false);
        alert('Endereço não encontrado!');
        return;
      };
      if (inputRefs.current[0]) {inputRefs.current[0].value = data[0]['rua']};
      if (inputRefs.current[1]) {inputRefs.current[1].value = data[0]['predio']};
      if (inputRefs.current[2]) {inputRefs.current[2].value = data[0]['nivel']};
      if (inputRefs.current[3]) {inputRefs.current[3].value = data[0]['apto']};
      if (inputRefs.current[4]) {inputRefs.current[4].value = data[0]['coddeposito']};
      if (codigoInputRef.current) codigoInputRef.current.value = data[0]['codenderecomer'];
      setEndereco({ rua: data[0]['rua'], edi: data[0]['predio'], andar: data[0]['nivel'], apto: data[0]['apto'], dep: data[0]['coddeposito'] });
      setIsReadOnly(true);
      setIsFiltrando(false);
      setCodigoend(data[0]['codenderecomer']);
      setMercadoriasEAceitaInsercao(data);
    }
    catch (err) {
      setIsFiltrando(false);
      throw new Error(`Request failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
 // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setMercadoriasEAceitaInsercao(data: any){
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (data.length > 0 && (data.filter((m: any) => Number(m.quantidade) > 0).length > 0)) { 
      setMercadorias(data);
      if (data[0]['coddeposito'] == '99'){
        setdepAceitaInserir(true);
        return;
      }
      setdepAceitaInserir(false);
      return;
    } 
      SemMercadorias();
      setdepAceitaInserir(true);
  }

  function LimparInputs(leitor?: boolean) {
    let index = 0;
    if (inputRefs.current) {
      inputRefs.current.forEach(el => {
        if (el && index != 4) el.value = '';
        index++;
      });
    }
    if (codigoInputRef.current && !leitor) {
      codigoInputRef.current.value = '';
    }
    setIsReadOnly(false);
    setEndereco({...endereco, rua: '', edi: '', andar: '', apto: ''});
    setCodigoend('');
    setMercadorias([]);
  }

  function HandleInputClick(){
    if (isReadOnly) alert('Clique no botão limpar para conseguir editar os campos!');
  }

  return (
    <div className="h-svh max-h-svh w-svw max-w-svw bg-orange-200">
      {isFiltrando && <FiltrandoInfos></FiltrandoInfos>}
      {loginEfetuado && <LoginSuccess ID={usuarioLogado}></LoginSuccess>}
      {usuarioLogado == '' && <Login onConfirm={FazerLogin}></Login>}
      {isAcertando && <Acerto onConfirm={AcertarQuant}></Acerto>}
      {isInserindo && <Inserir onConfirm={AcertarQuant}></Inserir>}
      {acertook && <AcertoSuccess></AcertoSuccess>}
      {inserirok && <InserirSuccess></InserirSuccess>}
      {confirmation && <CodigoSucess></CodigoSucess>}
      {(mercadorias[0] == 0) && <SemMercadoria></SemMercadoria>}
      {isExcluindo && <ExcluirConfirm nomeMerc={mercadoriaSelecionada[0] + '-' + mercadoriaSelecionada[2]} onConfirm={HandleExcluir}></ExcluirConfirm>}
      <main className="flex flex-col h-full w-full justify-items-center items-stretch bg-[#1c2c2c] text-white">
        <div className="mt-5 flex flex-col items-center">
          <div className="flex flex-row w-full items-center text-center">
            <label className="text-sm">Código do endereço:</label>
            <input type="number" ref={codigoInputRef} placeholder="Digite ou leia o código de barras" readOnly = {isReadOnly} onClick={HandleInputClick}
              className={`placeholder-gray-600 ${codigoEnd == '' ? 'italic' : 'not-italic'} text-center bg-[#cbd0d2] text-black p-1 rounded-sm border-1 m-1 border-orange-600 max-w-full w-full`}
              onChange={(e) => {setCodigoend(e.currentTarget.value); if (e.currentTarget.value.length == 7) {LimparInputs(true); FiltrarEndereco(e.currentTarget.value, {rua: '', edi: '', andar: '', apto: '', dep: '' })}}}>
            </input>
            <button onClick={HandleLerCodigoButton} className=" px-3 rounded-xl bg-orange-600 text-white text-sm h-10 mr-2">Abrir Leitor</button>
          </div>
          <div className="flex flex-row">
            <div className="flex flex-col mx-2 w-2/10 ">
              <label className="text-sm">Rua</label>
              <input key={'rua'} onChange={(e) => { setEndereco({ ...endereco, rua: e.currentTarget.value }) }} type="number" readOnly = {isReadOnly} onClick={HandleInputClick}
                ref={(el) => { inputRefs.current[0] = el }} className="placeholder-gray-300 bg-[#cbd0d2] text-center text-black p-1 rounded-sm border-1 border-orange-600 w-full"></input>
            </div>
            <div className="flex flex-col mx-2 w-2/10 ">
              <label className="text-sm">Edifício</label>
              <input key={'edi'} onChange={(e) => { setEndereco({ ...endereco, edi: e.currentTarget.value }) }} type="number" readOnly = {isReadOnly} onClick={HandleInputClick}
                ref={(el) => { inputRefs.current[1] = el }} className="placeholder-gray-300 bg-[#cbd0d2] text-center text-black p-1 rounded-sm border-1 border-orange-600 w-full"></input>
            </div>
            <div className="flex flex-col mx-2 w-2/10 ">
              <label className="text-sm">Andar</label>
              <input key={'andar'} onChange={(e) => { setEndereco({ ...endereco, andar: e.currentTarget.value }) }} type="number" readOnly = {isReadOnly} onClick={HandleInputClick}
                ref={(el) => { inputRefs.current[2] = el }} className="placeholder-gray-300 bg-[#cbd0d2] text-center text-black p-1 rounded-sm border-1 border-orange-600 w-full"></input>
            </div>
            <div className="flex flex-col mx-2 w-2/10 ">
              <label className="text-sm">Apto</label>
              <input key={'apto'} onChange={(e) => { setEndereco({ ...endereco, apto: e.currentTarget.value }) }} type="number" readOnly = {isReadOnly} onClick={HandleInputClick}
                ref={(el) => { inputRefs.current[3] = el }} className="placeholder-gray-300 bg-[#cbd0d2] text-center text-black p-1 rounded-sm border-1 border-orange-600 w-full"></input>
            </div>
            <div className="flex flex-col mx-2 w-2/10">
              <label className="text-sm">Deposito</label>
              <input key={'dep'} onChange={(e) => { setEndereco({ ...endereco, dep: e.currentTarget.value }) }} type="number" readOnly = {isReadOnly} onClick={HandleInputClick}
                ref={(el) => { inputRefs.current[4] = el }} className="placeholder-gray-300 bg-[#cbd0d2] text-center text-black p-1 rounded-sm border-1 border-orange-600 w-full"></input>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <button onClick={() => FiltrarEndereco()} className="p-2 rounded-xl mt-2 bg-orange-600 text-white w-20" >Buscar</button>
            <button onClick={() => LimparInputs()} className="p-2 rounded-xl mt-2 bg-orange-600 text-white w-20" >Limpar</button>
          </div>
        </div>
        <div className="flex-1 max-w-full p-1 rounded-sm border-1 m-2 border-orange-600 bg-[#cbd0d2]">
          {leitorativo && <Leitor desativar={desativarLeitor} mudarCodigo={mudarCodigo} isOpen={leitorativo}></Leitor>}
          {(mercadorias.length > 0) &&
            <div className="flex flex-cols-3 w-full text-black font-bold justify-between">
              <p>Cód Merc</p>
              <p>Nome</p>
              <p>Quantidade</p>
            </div>}
          {(mercadorias.length > 0) &&
            <ol>
              {mercadorias[0] != -1 && mercadorias[0] != 0 && mercadorias && mercadorias.filter((m) => Number(m['quantidade']) > 0).map((m) => <li onClick={(e) => { HandleListItemClick(e) }} className={`${(mercadoriaSelecionada[0] == m['id_mercadoria']) ? "bg-gray-400" : "bg-[#cbd0d2]"} border-1 rounded-sm text-black flex flex-cols-3 max-w-full p-3 justify-between`}
                data-id={m['id_mercadoria']} data-codend={m['codenderecomer']} data-desc={m['descricao']} key={m['id_mercadoria']} >
                <span className="p-2">{m['id_mercadoria']}</span>
                <span className="p-2">{m['descricao']}</span>
                <span className="p-2">{m['quantidade']}</span>
              </li>)}
            </ol>}
        </div>
        <div className="flex flex-row w-full justify-items-center items-center justify-around content-center px-20 mb-3">
          <button onClick={() => { (mercadoriaSelecionada.length > 0) ? setIsacertando(true) : alert('Selecione uma mercadoria primeiro!!'); }} 
          className="py-2 px-4 rounded-xl bg-orange-600 text-white mr-2">Acertar
          </button>
          <button onClick={() => { if (!depAceitaInserir) {alert('Endereço já possui mercadoria e o deposito não é o 99!'); return;}; codigoEnd ? setIsInserindo(true) : alert('Digite o código de um endereço primeiro!!'); }} 
          className="py-2 px-4 rounded-xl bg-orange-600 text-white mr-2">Inserir
          </button>
          <button onClick={() => { (mercadoriaSelecionada.length > 0) ? setIsExcluindo(true) : alert('Selecione uma mercadoria primeiro!!'); }} 
          className="py-2 px-4 rounded-xl bg-orange-600 text-white mr-2">Excluir
          </button>
        </div>
      </main>
    </div>
  );
}
