import { useState, useEffect } from "react";

type LoginSucess = {
    ID: string,
}

export default function LoginSuccess({ID}: LoginSucess) {
    const [logado, setLogado] = useState('');

    useEffect(() => {
        setTimeout(() => {
            setLogado(ID);
        }, 1500)
    },[ID])

    if (logado != '') {
        return (
            <div className="fixed top-0 right-0 z-50 flex items-center justify-center bg-black/0">
            <p className="text-sm text-center text-orange-600">Usuario: {logado}</p>
        </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                <p className="text-lg text-center text-orange-600">Usuario: {ID} logado com sucesso!</p>
            </div>
        </div>
    );
}