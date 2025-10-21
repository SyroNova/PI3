export function calcularEstado(fechaExamen) {
    const d = new Date(fechaExamen);
    const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 2 ? 'activo' : 'vencido';
}
