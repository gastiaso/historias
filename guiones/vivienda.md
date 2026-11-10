---
titulo: Cómo la vivienda se convirtió en el primer problema de España
entradilla: En el último año, el {esp_media} de los entrevistados por el CIS la cita entre los problemas del país. En noviembre de 2023, el {esp_inicio}.
firma: Guillermo Astiaso
---

<!--
CÓMO EDITAR ESTE GUION

Los comentarios como este no se publican: sirven para notas.

La cabecera (entre las dos líneas «---») lleva el título, la entradilla y la firma.

Cada «## nombre» empieza un paso: una tarjeta de texto que sube por encima del gráfico.
El nombre dice qué muestra el gráfico en ese paso. Los válidos son:
  con los barómetros: nube, nube-vivienda, linea, espana-personal, edad, ideologia, sexo, octubre, cierre
  con el monográfico de junio de 2026: junio, brecha, situaciones, intervencion, medidas
Si dos pasos seguidos usan el mismo nombre, el gráfico se queda quieto y solo cambia el texto.
Los pasos se pueden reordenar, repetir o quitar.

El apartado final «## rotulos» no es un paso: son los textos cortos de los gráficos (leyendas,
notas, la fuente), uno por línea con la forma «nombre: texto». También admiten cifras entre llaves.

El texto es Markdown: **negrita**, *cursiva*, [enlace](https://...). Una línea en blanco separa párrafos.

Las cifras no se escriben a mano: se ponen entre llaves y se rellenan con los datos.
  {esp_media}         → 43,6 %  (con su margen de error al pasar por encima)
  {esp_media:0}       → 44 %    (sin decimales)
  {esp_media:margen}  → 42,9–44,2 %
Los nombres empiezan por esp_ (problema de España) o per_ (problema personal), y salen en su color.
Las del monográfico de junio de 2026 empiezan por m_ (por ejemplo, {m_perjudica_25_34}).
Con «npm run dev», al final de la página está la lista de todas las cifras, con su valor y qué son.
Si un nombre no existe, la página da un error que dice cuál. Si escribes un porcentaje a mano,
la página lo señala arriba.
-->

## nube

Cada mes, salvo en agosto, el CIS pregunta a unas {n_habitual} personas cuáles son los principales problemas de España y cuáles les afectan a ellas personalmente. Cada punto es una de las {entrevistas} entrevistas de los {barometros} barómetros publicados entre {primer_mes} y {ultimo_mes}.

## nube-vivienda

En color, quienes citan la vivienda entre los problemas de España. En la primera mitad de 2021 casi nadie lo hacía: el {esp_2021}.

## linea

En {inicio_mes} la citaba el {esp_inicio}. En el último año, de {media_desde} a {media_hasta}, la media ha sido del {esp_media}. Desde {primero_desde} es el primer problema de España en todos los barómetros: {primero_seguidos} seguidos.

## espana-personal

La vivienda también se puede citar como problema personal. Hasta la primavera de 2024 se nombraba casi siempre como problema propio tanto o más que como problema del país. Desde {cruce} es al revés, y la distancia crece: en el último año, {esp_media} frente a {per_media}.

## edad

Como problema personal, depende mucho de la edad: la cita el {per_18_24:0} de quienes tienen de 18 a 24 años y el {per_65_mas:0} de los mayores de 65. Como problema de España, todas las edades están entre el {esp_edad_min:0} y el {esp_edad_max:0}.

**La sufren los jóvenes; la ven todos.**

## ideologia

También pesa la ideología. Como problema de España la cita el {esp_izq:0} de quienes se sitúan en la izquierda (1 y 2 en la escala) y el {esp_der:0} de quienes se sitúan en la derecha (9 y 10). La diferencia se mantiene dentro de cada grupo de edad, y es mayor como problema del país que como problema propio.

## sexo

Entre hombres y mujeres apenas hay diferencia en conjunto: como problema personal, {per_hombres} y {per_mujeres}. Entre los más jóvenes sí la hay: de 18 a 24 años la cita el {per_mujeres_18_24} de las mujeres y el {per_hombres_18_24} de los hombres.

Buena parte de esa distancia es ideológica: el {izq_jovenes_mujeres:0} de las mujeres de 18 a 34 años se sitúa entre el 1 y el 4 de la escala, frente al {izq_jovenes_hombres:0} de los hombres.

## octubre

El último dato, de {ultimo_mes}, es el más alto: {esp_final}, {salto_final} más que el mes anterior. Pero ese cuestionario empezaba con un bloque de preguntas sobre vivienda (el desahucio de Maricarmen, los decretos, las medidas) antes de preguntar por los problemas. Es el único de los {barometros} con un bloque así.

Ese mes también hubo mucha noticia sobre vivienda, y no hay forma de separar cuánto pesa cada cosa. Por eso esta historia no usa ese dato como titular.

<!-- A partir de aquí, el monográfico de vivienda del CIS (estudio 3532). -->

## junio

Para ver qué hay detrás de esa línea, el CIS dedicó en junio una encuesta entera a la vivienda, hecha junto al Ministerio de Vivienda y Agenda Urbana: {m_entrevistas} entrevistas, {m_campo}. Las cifras que siguen son del avance de resultados que publicó el {m_publicacion}; la versión definitiva puede corregirlas ligeramente.

Allí se pregunta de otra manera. Preguntado directamente, al {m_preocupa:0} le preocupa mucho o bastante la situación de la vivienda en España. No contradice el {esp_media} de los barómetros: una cosa es nombrarla sin que nadie te la sugiera y otra responder cuando te preguntan por ella.

## brecha

Las dos encuestas dibujan la misma brecha de edad. En la de junio, la situación de la vivienda «le está perjudicando» al {m_perjudica_25_34:0} de quienes tienen de 25 a 34 años y al {m_perjudica_65_mas:0} de los mayores de 65. En los barómetros, la citan como problema personal el {per_25_34:0} y el {per_65_mas:0}.

## situaciones

¿Qué significa que te perjudique? La encuesta pregunta por lo vivido en los últimos cinco años. Entre los 18 y los 34 años, el {m_ayuda_familia_18_34:0} ha necesitado dinero de su familia para pagar el alquiler o la hipoteca; el {m_mudarse_lejos_18_34:0} se ha ido a vivir lejos de los suyos por el precio, y el {m_volver_familia_18_34:0} ha tenido que volver con su familia o compartir piso porque no podía pagar su casa.

Entre los mayores de 65, ninguna de las tres pasa del {m_ayuda_familia_65_mas:0}. Encima del gráfico puedes marcar o desmarcar grupos de edad para añadirlos o quitarlos.

## intervencion

La situación de la vivienda preocupa casi por igual en todo el espectro ideológico: entre el {m_preocupa_centro_der:0} en el centro derecha y el {m_preocupa_centro_izq:0} en el centro izquierda. Y dice que le perjudica un porcentaje parecido en casi todos los grupos ({m_perjudica_izq:0} en la izquierda, {m_perjudica_centro_der:0} en el centro derecha), salvo en la derecha, donde sube al {m_perjudica_der:0}.

Lo que separa a unos de otros es la solución. Que el Estado intervenga en el mercado de la vivienda lo pide el {m_intervenir_izq:0} en la izquierda y el {m_intervenir_centro_der:0} en el centro derecha; en la derecha vuelve a subir, hasta el {m_intervenir_der:0}.

La pregunta enfrenta intervenir con dejar el precio a «la ley de la oferta y la demanda», una forma de plantearlo que puede empujar hacia la primera opción.

## medidas

¿Qué medidas? De las diez por las que preguntó el CIS, casi todas tienen más apoyos que rechazos. El saldo más alto es el de bajar los impuestos en la compra de la primera vivienda ({m_impuestos_primera_neto} puntos), seguido de dar más garantías a los caseros ({m_garantias_caseros_neto}) y sacar suelo urbanizable al mercado ({m_suelo_urbanizable_neto}). Solo expropiar viviendas vacías tiene más rechazo que apoyo ({m_expropiar_vacias_neto}).

El saldo es el porcentaje a favor menos el porcentaje en contra. Se usa porque, en baterías así, mucha gente tiende a decir que sí a todo.

## medidas

Cada medida del gráfico se puede abrir. Púlsala, o tócala en el móvil, y verás cómo cambia el apoyo por edad, sexo, ideología, recuerdo de voto, estudios, ocupación, clase social, tamaño del municipio o religiosidad.

Las barras se leen igual que aquí: en contra a la izquierda, a favor a la derecha y el saldo al final. Cada cifra enseña su margen de error al tocarla, y los grupos con menos de 50 entrevistas van sin dato.

## cierre

Todos los datos de esta historia, mes a mes y por grupos, están en [*Barómetro a barómetro*](https://gastiaso.github.io/barometros/#vivienda), con su método y sus márgenes de error. Los de la encuesta de junio, en el [avance de resultados del CIS](https://www.cis.es/es/w/avance-de-resultados-del-estudio-3532-bar%C3%B3metro-de-vivienda-2026-).

## rotulos

nube: Cada punto, una entrevista: {puntos_por_barometro} por barómetro, sin ponderar
espana: Problema de España
personal: Problema personal
r10: Desde aquí, el CIS pondera también por estudios
avisos: Cuestionario con preguntas de vivienda antes de la de problemas
media: Media del último año: {esp_media}
cruce: {cruce}
octubre: Ese cuestionario empezaba con un bloque sobre vivienda
mujeres: Mujeres
hombres: Hombres
sin_ubicar: No se sitúa en la escala el {sin_ubicar} de los entrevistados
fuente: Barómetros del CIS. Porcentaje que cita la vivienda entre los problemas que menciona (hasta tres). Bandas: margen de error al 95 %.
junio: Encuesta de vivienda del CIS, {m_mes}
perjudica: Le perjudica (encuesta de junio)
barometros: Problema personal (barómetros, último año)
cohortes: 18-34, 65 y más
cohortes_titulo: Grupos de edad que se muestran
preocupa: Le preocupa mucho o bastante (encuesta de junio)
situaciones: ayuda_familia, mudarse_lejos, volver_familia, subida_alquiler, sin_contrato, frio_calor
intervenir: El Estado debe intervenir (encuesta de junio)
favor: A favor
contra: En contra
saldo: Saldo
desglose_pista: Elige una medida para verla por grupos
desglose: Desglose por grupos
desglose_por: Ver por
desglose_total: Total
desglose_pocas: Menos de 50 entrevistas
desglose_nota: Avance de resultados del CIS (estudio 3532). Los grupos con menos de 50 entrevistas van sin dato. Márgenes de error aproximados: aparecen al tocar o señalar cada cifra.
cruces: edad, sexo, ideologia, voto, estudios, ocupacion, clase, municipio, religiosidad
fuente_monografico: CIS, Barómetro de Vivienda 2026 (estudio 3532), avance de resultados del {m_publicacion}: {m_entrevistas} entrevistas, {m_campo}. Márgenes de error aproximados.
