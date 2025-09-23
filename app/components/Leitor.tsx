'use client';

import { useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

type LeitorCodigo = {
  isOpen: boolean;
  mudarCodigo: (codigo: string) => void;
  desativar: () => void;
}

const Leitor = ({ mudarCodigo, isOpen, desativar }: LeitorCodigo) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  //alert('Antes do Use effect entrou');
  useEffect(() => {
    if (!isOpen || !videoRef.current) return;
    const codeReader = new BrowserMultiFormatReader();
    //alert('Use effect entrou');
    if (videoRef.current) {
      codeReader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err, controls) => {
          if (result) {
            console.log('Código detectado:', result.getText());
            mudarCodigo(result.getText());
            controls.stop();
            desativar();
          }
        }
      );
    }
    return;
  }, []);


  return (
    <div className='flex flex-col max-h-full h-full max-w-full w-full items-center justify-center '>
      <div className='flex max-w-full h-1/3 items-center justify-center self-center place-content-center place-items-center rounded-sm w-full'>
        <video muted playsInline autoPlay ref={videoRef} className='object-cover object-center' style={{  width: '100%', height: '170px', maxWidth: '400px' }} />
      </div>
      <div className='flex flex-row items-center justify-center self-center place-content-center place-items-center w-full'>
        <button className='w-25 py-1 mt-2 rounded bg-red-500 text-white hover:bg-red-300 self-center text-center' onClick={desativar}>Cancelar</button>
      </div>
    </div>
  );
};

export default Leitor;