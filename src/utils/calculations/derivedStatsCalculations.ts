import { ORIGIN_CATEGORIES } from '../../data/originDefinitions';

/**
 * Calcula las estadísticas derivadas para el Paso 6
 */
export function calculateDerivedStats(
    attributes: { [key: string]: number },
    origins: any[] = [],
    skills: any = {}
) {
    // Normalizar atributos
    const stats = {
        fuerza: 0,
        constitucion: 0,
        agilidad: 0,
        inteligencia: 0,
        percepcion: 0,
        apariencia: 0,
        voluntad: 0
    };

    if (attributes) {
        Object.keys(attributes).forEach(key => {
            const normalizedKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            stats[normalizedKey as keyof typeof stats] = attributes[key] || 0;
        });
    }

    // --- CÁLCULOS BÁSICOS ---
    const fue = stats.fuerza;
    const con = stats.constitucion;
    const agi = stats.agilidad;
    const int = stats.inteligencia;
    const per = stats.percepcion;
    // const apa = stats.apariencia;
    const vol = stats.voluntad;

    // Puntos de Vida
    let puntosVida = 0;
    let recuperacion = 0;
    let daFisico = 0;

    // --- TABLE CALCULATIONS (CONSTITUCIÓN) ---
    if (con <= 100) {
        puntosVida = Math.floor(con / 2);
        daFisico = 0;
        recuperacion = 1;
    } else if (con <= 110) {
        puntosVida = con - 45;
        daFisico = 15;
        recuperacion = 2;
    } else if (con <= 120) {
        puntosVida = con - 40;
        daFisico = 30;
        recuperacion = 4;
    } else if (con <= 130) {
        puntosVida = con - 35;
        daFisico = 45;
        recuperacion = 6;
    } else if (con <= 140) {
        puntosVida = con - 30;
        daFisico = 60;
        recuperacion = 10;
    } else if (con <= 150) {
        puntosVida = con - 25;
        daFisico = 75;
        recuperacion = 15;
    } else if (con <= 160) {
        puntosVida = con - 20;
        daFisico = 90;
        recuperacion = 20;
    } else if (con <= 170) {
        puntosVida = con - 15;
        daFisico = 105;
        recuperacion = 25;
    } else if (con <= 180) {
        puntosVida = con - 10;
        daFisico = 120;
        recuperacion = 30;
    } else if (con <= 190) {
        puntosVida = con - 5;
        daFisico = 135;
        recuperacion = 35;
    } else {
        // 191-200+
        puntosVida = con;
        daFisico = 150;
        recuperacion = 40;
    }

    // Iniciativa y Reflejos: (AGI + PER) / 4
    let iniciativaReflejos = Math.floor((agi + per) / 4);

    // Check for Artes Marciales skill bonus (can be General or Special)
    const hasMartialArts =
        skills?.generalItems?.some((skill: any) =>
            skill.name?.toLowerCase().includes('artes marciales') ||
            skill.name?.toLowerCase().includes('arte marcial')
        ) ||
        skills?.specialItems?.some((skill: any) =>
            skill.name?.toLowerCase().includes('artes marciales') ||
            skill.name?.toLowerCase().includes('arte marcial')
        ) || false;

    // Equilibrio Mental: INT
    const equilibrioMental = int;


    // --- OTROS STATS ---

    // Inconsciencia: PV / 10
    const inconsciencia = Math.floor(puntosVida / 10);

    // Recuperación calculada en tabla CON

    // --- TABLE CALCULATIONS (FUERZA) ---
    // Resistencia a gases y venenos: CON / 3
    const resistenciaGases = Math.floor(con / 3);

    let modFuerzaStr = "+0";
    let pesoLevantadoStr = "0kg";
    let jumpMod = 1;

    if (fue < 40) {
        modFuerzaStr = "0";
        pesoLevantadoStr = "0kg";
        jumpMod = 1;
    } else if (fue <= 75) {
        modFuerzaStr = "1d4";
        pesoLevantadoStr = `${fue}kg`;
        jumpMod = 1;
    } else if (fue <= 90) {
        modFuerzaStr = "1d6";
        pesoLevantadoStr = `${fue * 2}kg`;
        jumpMod = 1;
    } else if (fue <= 99) {
        modFuerzaStr = "1d8";
        pesoLevantadoStr = `${fue * 3}kg`;
        jumpMod = 1;
    } else if (fue === 100) {
        modFuerzaStr = "1d10";
        pesoLevantadoStr = "500kg";
        jumpMod = 1;
    } else if (fue <= 102) {
        modFuerzaStr = "1d10+2";
        pesoLevantadoStr = "1 t";
        jumpMod = 2;
    } else if (fue <= 104) {
        modFuerzaStr = "2d10+2";
        pesoLevantadoStr = "2 t";
        jumpMod = 2;
    } else if (fue <= 106) {
        modFuerzaStr = "2d10+4";
        pesoLevantadoStr = "4 t";
        jumpMod = 2;
    } else if (fue <= 108) {
        modFuerzaStr = "3d10+4";
        pesoLevantadoStr = "6 t";
        jumpMod = 2;
    } else if (fue <= 110) {
        modFuerzaStr = "3d10+6";
        pesoLevantadoStr = "8 t";
        jumpMod = 2;
    } else if (fue <= 112) {
        modFuerzaStr = "4d10+6";
        pesoLevantadoStr = "10 t";
        jumpMod = 2;
    } else if (fue <= 114) {
        modFuerzaStr = "4d10+8";
        pesoLevantadoStr = "12 t";
        jumpMod = 2;
    } else if (fue <= 116) {
        modFuerzaStr = "5d10+8";
        pesoLevantadoStr = "14 t";
        jumpMod = 2;
    } else if (fue === 117) {
        modFuerzaStr = "5d10+10";
        pesoLevantadoStr = "16 t";
        jumpMod = 2;
    } else if (fue === 118) {
        modFuerzaStr = "5d10+15";
        pesoLevantadoStr = "18 t";
        jumpMod = 2;
    } else if (fue === 119) {
        modFuerzaStr = "5d10+20";
        pesoLevantadoStr = "19 t";
        jumpMod = 2;
    } else {
        // 120+
        const diff = fue - 100;
        modFuerzaStr = `1d100+${diff}`;
        pesoLevantadoStr = `${diff} t`;

        if (fue <= 120) jumpMod = 2;
        else if (fue <= 140) jumpMod = 5;
        else if (fue <= 160) jumpMod = 10;
        else if (fue <= 180) jumpMod = 20;
        else if (fue <= 199) jumpMod = 40;
        else jumpMod = 100;
    }

    // --- TABLE CALCULATIONS (AGILIDAD) ---
    // Tabla 1-4: AGILIDAD
    let paradaFisica = 0;
    let acciones = 0;
    let jumpDivisor = 12;
    let modImpacto = 0;

    if (agi <= 75) {
        paradaFisica = Math.floor(agi / 4);
        acciones = 1;
        jumpDivisor = 12;
        modImpacto = 0;
    } else if (agi <= 90) {
        paradaFisica = Math.floor(agi / 4);
        acciones = 2;
        jumpDivisor = 11;
        modImpacto = 0;
    } else if (agi <= 100) {
        paradaFisica = Math.floor(agi / 4);
        acciones = 3;
        jumpDivisor = 10;
        modImpacto = 0;
    } else if (agi <= 115) {
        paradaFisica = 30;
        acciones = 3;
        jumpDivisor = 10;
        modImpacto = agi - 100;
    } else if (agi <= 130) {
        paradaFisica = 40;
        acciones = 3;
        jumpDivisor = 9;
        modImpacto = agi - 100;
    } else if (agi <= 145) {
        paradaFisica = 50;
        acciones = 4;
        jumpDivisor = 9;
        modImpacto = agi - 100;
    } else if (agi <= 160) {
        paradaFisica = 55;
        acciones = 4;
        jumpDivisor = 8;
        modImpacto = agi - 100;
    } else if (agi <= 175) {
        paradaFisica = 60;
        acciones = 4;
        jumpDivisor = 8;
        modImpacto = agi - 100;
    } else if (agi <= 190) {
        paradaFisica = 65;
        acciones = 5;
        jumpDivisor = 7;
        modImpacto = agi - 100;
    } else if (agi <= 195) {
        paradaFisica = 70;
        acciones = 5;
        jumpDivisor = 6;
        modImpacto = agi - 100;
    } else if (agi <= 199) {
        paradaFisica = 75;
        acciones = 5;
        jumpDivisor = 5;
        modImpacto = agi - 100;
    } else {
        // 200+
        paradaFisica = 80;
        acciones = 6;
        jumpDivisor = 4;
        modImpacto = agi - 100;
    }

    // Apply Martial Arts bonus to Physical Parry (+20)
    if (hasMartialArts) {
        paradaFisica += 20;
    }

    // Apply Martial Arts bonus to Initiative (+20)
    if (hasMartialArts) {
        iniciativaReflejos += 20;
    }

    // --- TABLE CALCULATIONS (VOLUNTAD) ---
    let paradaMental = 0;
    let modPsionico = 0;

    // --- TABLE CALCULATIONS (INTELIGENCIA) ---
    let daMental = 0;
    if (int <= 100) {
        daMental = 0;
    } else if (int <= 120) {
        daMental = 40;
    } else if (int <= 140) {
        daMental = 60;
    } else if (int <= 160) {
        daMental = 80;
    } else if (int <= 180) {
        daMental = 100;
    } else {
        // 181-200+
        daMental = 120;
    }

    if (vol <= 50) {
        paradaMental = -25;
        modPsionico = -50;
    } else if (vol <= 60) {
        paradaMental = -10;
        modPsionico = -25;
    } else if (vol <= 70) {
        paradaMental = 0;
        modPsionico = -10;
    } else if (vol <= 80) {
        paradaMental = 10;
        modPsionico = 0;
    } else if (vol <= 90) {
        paradaMental = 25;
        modPsionico = 10;
    } else if (vol <= 100) {
        paradaMental = 50;
        modPsionico = 25;
    } else if (vol <= 120) {
        paradaMental = 55;
        modPsionico = 30;
    } else if (vol <= 150) {
        paradaMental = 60;
        modPsionico = 35;
    } else if (vol <= 170) {
        paradaMental = 65;
        modPsionico = 40;
    } else {
        // 171-200+
        paradaMental = 75;
        modPsionico = 50;
    }


    // Modificador por Origen (Mental Parry)
    let maxOriginBonus = 0;
    // Origins structure: [ { "NombreOrigen": ["efecto1", ...] }, ... ]
    if (origins && origins.length > 0) {
        origins.forEach(originObj => {
            // The key is the origin category (e.g. "Parahumano", "Divino")
            // The value is an array (e.g. ["Thals"], ["Poder divino"])
            const originCategory = Object.keys(originObj)[0];
            const originDetails = originObj[originCategory] || [];
            if (!originCategory) return;

            let currentBonus = 0;

            // 1. Check if "Thals" is in the details array
            const hasThals = originDetails.some((detail: string) =>
                detail.toLowerCase().includes('thals') || detail.toLowerCase().includes('thal')
            );

            if (hasThals) {
                currentBonus = 10;
            } else {
                // 2. Check the category name
                const categoryLower = originCategory.toLowerCase();

                let categoryName = "";

                // Direct Category Match
                const catKeys = Object.keys(ORIGIN_CATEGORIES);
                for (const cat of catKeys) {
                    if (cat.toLowerCase() === categoryLower) {
                        categoryName = cat;
                        break;
                    }
                }

                // Apply Bonus based on Category
                if (categoryName === "Divino") currentBonus = 25;
                else if (categoryName === "Cósmico") currentBonus = 25;
                else if (categoryName === "Arcano") currentBonus = 20;
                else if (categoryName === "Sobrenatural") currentBonus = 20;
            }

            if (currentBonus > maxOriginBonus) {
                maxOriginBonus = currentBonus;
            }
        });
    }

    paradaMental += maxOriginBonus;

    // Salto: 
    // Base from Agility Table applied with Strength Multiplier
    const saltoBase = agi / jumpDivisor;
    const saltoLargoVal = saltoBase * jumpMod;
    const saltoAltoVal = saltoLargoVal / 3;

    const saltoLargo = saltoLargoVal.toFixed(1);
    const saltoAlto = saltoAltoVal.toFixed(1);

    const saltoStr = `${saltoAlto}m / ${saltoLargo}m`;

    return {
        combat: {
            acciones: `${acciones}`,
            iniciativa: `${iniciativaReflejos}`,
            pv: `${puntosVida}`,
            equilibrio: `${equilibrioMental}`
        },
        other: {
            inconsciencia: `${inconsciencia}`,
            recuperacion: `${recuperacion} PV/h`,
            resistenciaGases: `${resistenciaGases}%`,
            modFuerza: modFuerzaStr,
            pesoLevantado: pesoLevantadoStr,
            daAbsorbidoFisico: `${daFisico}`,
            daAbsorbidoMental: `${daMental}`,
            modImpacto: `${modImpacto}`,
            modPsionico: `${modPsionico}`,
            paradaFisica: `${paradaFisica}`,
            paradaMental: `${paradaMental}`,
            salto: saltoStr.replace(/\./g, ',')
        }
    };
}
