export default function VolItemTooltip() {
    return (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 block w-60 h-15
                  bg-white text-black text-xs rounded px-2 py-1 whitespace-nowrap z-50">
            Eu sou um tooltip!
            <div className="absolute top-[93%] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45"></div>
        </div>
    );
}