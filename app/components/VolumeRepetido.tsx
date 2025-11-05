type VolumeRepetido = {
    OKBtn: () => void;
}

export default function VolumeRepetido({ OKBtn }: VolumeRepetido) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full max-w-md justify-items-center">
                <p className="text-lg text-center text-orange-600">Volume já foi lido e está aguardando resposta ou já está certo!</p>
                <div className="flex w-full items-center justify-center gap-5">
                    <button className="w-20 mt-2 px-4 py-1 rounded bg-green-500 text-white hover:bg-green-300 self-center" onClick={() => { OKBtn() }}>OK</button>
                </div>
            </div>
        </div>
    );
}