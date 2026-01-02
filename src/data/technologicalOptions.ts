
export const INCOME_SOURCES = [
    {
        id: 'propios',
        label: 'Ingresos Propios',
        description: 'El personaje tiene sus recursos para mantener y poseer la tecnología.',
        pc: 8
    },
    {
        id: 'mecenas',
        label: 'Mecenas',
        description: 'Un personaje importante decide financiar el gasto y la manutención. El mecenas puede requerir la colaboración del personaje, aunque por lo general es libre de tomar sus propias decisiones.',
        pc: 6
    },
    {
        id: 'compania',
        label: 'Compañía Privada',
        description: 'El PJ trabaja para una compañía privada no relacionada con el tema de los metahumanos, pero que le ha contratado para proteger sus activos. Esto le acarrea ciertas responsabilidades, pero también le deja las manos libres para actuar en otros temas.',
        pc: 4
    },
    {
        id: 'agencia_gub',
        label: 'Agencia de metahumanos gubernamental',
        description: 'El personaje se encuentra dentro de un programa civil o militar que le permite financiar sus necesidades aunque esto vincula sus acciones a los intereses de esa agencia.',
        pc: 2
    },
    {
        id: 'agencia_priv',
        label: 'Agencia de metahumanos privada',
        description: 'Idéntica a la opción anterior, salvo quien paga las facturas es una agencia privada.',
        pc: 0
    }
];
