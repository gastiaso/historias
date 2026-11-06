"""Datos de la historia «La vivienda» a partir de los microdatos armonizados de Barómetro a barómetro.

Uso:
    python datos/preparar_vivienda.py RUTA/barometros_armonizados.parquet

Escribe en static/datos/vivienda/: serie.json, grupos.json y puntos.json.
Cálculo como en Barómetro a barómetro: porcentaje de entrevistados que citan «La vivienda» (PROB_007) entre sus hasta
tres menciones, con el peso del CIS; base, quien tiene primera mención distinta de «no procede» (NS/NC dentro de la
base); margen al 95 % con el intervalo de Wilson sobre el tamaño efectivo (efecto de diseño de Kish en cada base).
Requiere pandas y pyarrow."""
import argparse, json, math, os
import numpy as np, pandas as pd

VIV = 'PROB_007'
EDAD = ['18-24', '25-34', '35-44', '45-54', '55-64', '65 y más']
IDEO = ['Izquierda (1-2)', 'Centro izquierda (3-4)', 'Centro (5-6)', 'Centro derecha (7-8)', 'Derecha (9-10)']
VENTANAS = [('2023-11', '2024-10'), ('2024-11', '2025-10'), ('2025-11', '2026-10')]
RUPTURAS = [{'mes': '2023-11', 'id': 'R10', 'etiqueta': 'ponderación por estudios',
             'texto': 'Desde noviembre de 2023 el CIS pondera también por nivel de estudios: no se comparan cifras de un lado y otro de la línea.'}]
AVISOS = [
    {'mes': '2024-06', 'estudio': '3463', 'texto': 'Antes de la pregunta de problemas, el cuestionario preguntaba por la igualdad de oportunidades para «tener acceso a una vivienda».'},
    {'mes': '2026-10', 'estudio': '3582', 'texto': 'El cuestionario empieza con un bloque sobre vivienda (el desahucio de Maricarmen, los decretos y sus medidas) antes de la pregunta de problemas.'},
]
SEMILLA = 7
PUNTOS_POR_MES = 320


def wilson(p, n):
    z = 1.96
    if n <= 0:
        return (None, None)
    den = 1 + z * z / n
    c = (p + z * z / (2 * n)) / den
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return (max(0.0, c - h), min(1.0, c + h))


def menciones(df, bloque, ident=VIV, solo_primera=False):
    cols = [f'{bloque}_1'] if solo_primera else [f'{bloque}_1', f'{bloque}_2', f'{bloque}_3']
    m = np.zeros(len(df), bool)
    for c in cols:
        m |= df[c].astype(str).eq(ident).to_numpy()
    return m


def resumen(df, bloque, solo_primera=False):
    base = df[df[f'{bloque}_1'].notna() & df[f'{bloque}_1'].astype(str).ne('NP')]
    n = len(base)
    if n == 0:
        return {'n': 0, 'v': None, 'lo': None, 'hi': None}
    w = base['peso'].to_numpy()
    y = menciones(base, bloque, solo_primera=solo_primera)
    p = float((w * y).sum() / w.sum())
    deff = n * float((w * w).sum()) / float(w.sum()) ** 2
    lo, hi = wilson(p, n / deff)
    r1 = lambda x: None if x is None else round(100 * x, 1)
    return {'n': n, 'v': r1(p), 'lo': r1(lo), 'hi': r1(hi), 'sp': round(100 * float(y.mean()), 1)}


def puesto(df, bloque):
    base = df[df[f'{bloque}_1'].astype(str).ne('NP')]
    w = base['peso'].to_numpy()
    ids = set()
    for k in (1, 2, 3):
        ids |= {i for i in base[f'{bloque}_{k}'].astype(str).unique() if i.startswith('PROB_')}
    vals = {i: float((w * menciones(base, bloque, i)).sum()) for i in ids}
    orden = sorted(vals, key=vals.get, reverse=True)
    return orden.index(VIV) + 1 if VIV in orden else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('parquet')
    ap.add_argument('--salida', default=os.path.join(os.path.dirname(__file__), '..', 'static', 'datos', 'vivienda'))
    a = ap.parse_args()
    d = pd.read_parquet(a.parquet)
    os.makedirs(a.salida, exist_ok=True)
    meses = sorted(d['mes'].unique())

    # serie mensual
    S = {k: {'v': [], 'lo': [], 'hi': [], 'sp': []} for k in ('esp', 'per')}
    P1 = {'esp': [], 'per': []}
    PU = {'esp': [], 'per': []}
    N = []
    for m in meses:
        g = d[d['mes'] == m]
        N.append(len(g))
        for k, bl in (('esp', 'prob_esp'), ('per', 'prob_per')):
            r = resumen(g, bl)
            for c in ('v', 'lo', 'hi', 'sp'):
                S[k][c].append(r[c])
            P1[k].append(resumen(g, bl, solo_primera=True)['v'])
            PU[k].append(puesto(g, bl))
    # cifras para el texto
    i = {m: j for j, m in enumerate(meses)}
    ult = meses[-1]
    medias = []
    for desde, hasta in VENTANAS:
        x = d[(d['mes'] >= desde) & (d['mes'] <= hasta)]
        medias.append({'desde': desde, 'hasta': hasta, 'esp': resumen(x, 'prob_esp'), 'per': resumen(x, 'prob_per')})
    seguidos = 0
    for p in reversed(PU['esp']):
        if p != 1:
            break
        seguidos += 1
    cruce = next(m for j, m in enumerate(meses) if all(e > p for e, p in zip(S['esp']['v'][j:], S['per']['v'][j:])))
    a2021 = d[d['mes'] <= '2021-08']
    texto = {
        'ultimo': ult,
        'anyo2021': {'esp': resumen(a2021, 'prob_esp'), 'per': resumen(a2021, 'prob_per')},
        'inicio_tramo': {'mes': '2023-11', 'esp': resumen(d[d['mes'] == '2023-11'], 'prob_esp'), 'per': resumen(d[d['mes'] == '2023-11'], 'prob_per')},
        'final': {'mes': ult, 'esp': resumen(d[d['mes'] == ult], 'prob_esp'), 'per': resumen(d[d['mes'] == ult], 'prob_per')},
        'anterior': {'mes': meses[-2], 'esp': resumen(d[d['mes'] == meses[-2]], 'prob_esp'), 'per': resumen(d[d['mes'] == meses[-2]], 'prob_per')},
        'medias': medias,
        'primero_esp': {'seguidos': seguidos, 'desde': meses[len(meses) - seguidos]},
        'primero_per': [m for m, p in zip(meses, PU['per']) if p == 1],
        'cruce': cruce,
    }
    serie = {'meses': meses, 'n': N, 'esp': S['esp'], 'per': S['per'], 'esp1': P1['esp'], 'per1': P1['per'],
             'puesto_esp': PU['esp'], 'puesto_per': PU['per'], 'rupturas': RUPTURAS, 'avisos': AVISOS, 'texto': texto,
             'edicion': {'estudios': len(meses), 'entrevistas': int(len(d)), 'desde': meses[0], 'hasta': ult}}

    # grupos: último año
    desde, hasta = VENTANAS[-1]
    U = d[(d['mes'] >= desde) & (d['mes'] <= hasta)]
    eg, sx, ig = U['edad_g'].astype(str), U['sexo'].astype(str), U['ideologia_g'].astype(str)
    grupos = {
        'ventana': {'desde': desde, 'hasta': hasta},
        'edad': [{'g': e, 'per': resumen(U[eg == e], 'prob_per'), 'esp': resumen(U[eg == e], 'prob_esp'),
                  'per_anual': [resumen(d[(d['mes'] >= a) & (d['mes'] <= b) & d['edad_g'].astype(str).eq(e)], 'prob_per')['v'] for a, b in VENTANAS]}
                 for e in EDAD],
        'ideologia': [{'g': x, 'per': resumen(U[ig == x], 'prob_per'), 'esp': resumen(U[ig == x], 'prob_esp'),
                       'esp_edad': {e: resumen(U[(ig == x) & (eg == e)], 'prob_esp')['v'] for e in EDAD}} for x in IDEO],
        'sin_ubicar': round(100 * float(U.loc[ig.isin(['NS', 'NC']), 'peso'].sum() / U['peso'].sum()), 1),
        'sexo': {s: {'per': resumen(U[sx == s], 'prob_per'), 'esp': resumen(U[sx == s], 'prob_esp')} for s in ('Hombre', 'Mujer')},
        'sexo_edad': [{'g': e, **{s: resumen(U[(eg == e) & (sx == s)], 'prob_per') for s in ('Hombre', 'Mujer')}} for e in EDAD],
        'jovenes_izq': {s: round(100 * float(U.loc[eg.isin(EDAD[:2]) & (sx == s) & ig.isin(IDEO[:2]), 'peso'].sum()
                                          / U.loc[eg.isin(EDAD[:2]) & (sx == s), 'peso'].sum()), 1) for s in ('Hombre', 'Mujer')},
        'edad_media_ideo': [round(float(np.average(U.loc[ig == x, 'edad'], weights=U.loc[ig == x, 'peso'])), 1) for x in IDEO],
    }

    # puntos: muestra sin ponderar, igualada por mes, semilla fija
    rng = np.random.default_rng(SEMILLA)
    filas = []
    for m in meses:
        g = d[d['mes'] == m]
        k = min(PUNTOS_POR_MES, len(g))
        filas.append(g.iloc[rng.choice(len(g), size=k, replace=False)])
    M = pd.concat(filas)
    M = M.iloc[rng.permutation(len(M))]          # orden de dibujo al azar
    igm = M['ideologia_g'].astype(str)
    puntos = {
        'n': int(len(M)), 'por_mes': PUNTOS_POR_MES, 'semilla': SEMILLA, 'ponderado': False,
        'mes': [i[m] for m in M['mes']],
        'dia': [int(x) for x in rng.integers(0, 100, len(M))],
        'edad': [int(min(x, 92)) for x in M['edad']],
        'eg': [EDAD.index(x) if x in EDAD else -1 for x in M['edad_g'].astype(str)],
        'sx': [1 if x == 'Mujer' else 0 for x in M['sexo'].astype(str)],
        'ig': [IDEO.index(x) if x in IDEO else 5 for x in igm],
        'esp': [int(x) for x in menciones(M, 'prob_esp')],
        'per': [int(x) for x in menciones(M, 'prob_per')],
    }
    for nombre, obj in (('serie', serie), ('grupos', grupos), ('puntos', puntos)):
        with open(os.path.join(a.salida, f'{nombre}.json'), 'w', encoding='utf-8') as f:
            json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
    print('ok:', a.salida, len(meses), 'barómetros,', len(d), 'entrevistas,', len(M), 'puntos')


if __name__ == '__main__':
    main()
