import { useState, useRef } from "react"

type login = {
    onConfirm: (senha: string, apelido: string) => void;
}

export default function Login({onConfirm}: login) {

    const inputRef = useRef<HTMLInputElement>(null);
    const SenhainputRef = useRef<HTMLInputElement>(null);

    const [senha,setSenha] = useState('');
    const [apelido,setApelido] = useState('');

    function AtualizarValorInput() : string{
        if (inputRef.current){
            return (inputRef.current.value.toLocaleUpperCase());
        }
        return ('');
    }

    function AtualizarValorInputSenha() : string{
        if (SenhainputRef.current){
            return (SenhainputRef.current.value.toLocaleUpperCase());
        }
        return ('');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full max-w-md justify-items-center mx-2">
                <p className="text-lg text-center text-orange-600 min-w-full">Faça seu login:</p>
                <input ref={inputRef} placeholder="Nome do usuário" className="rounded-sm border-1 h-8 w-full p-4 text-center my-1 uppercase" onChange={(e) => setApelido(e.currentTarget.value.toLocaleUpperCase())}></input>
                <input ref={SenhainputRef} placeholder="Digite sua senha" type='password' className="rounded-sm border-1 h-8 w-full p-4 text-center my-1" onChange={(e) => setSenha(e.currentTarget.value)}></input>
                <button className="w-20 mt-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-300 self-center" onClick={() => onConfirm(AtualizarValorInputSenha(), AtualizarValorInput())}>Login</button>
            </div>
        </div>
    )
}