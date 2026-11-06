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
  nube, nube-vivienda, linea, espana-personal, edad, ideologia, sexo, octubre, cierre
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

## linea

La línea de puntos marca {r10_mes}: desde ese mes el CIS pondera también por nivel de estudios, y las cifras de un lado y otro no se comparan. Casi toda la subida ocurre después de esa línea.

## espana-personal

La vivienda también se puede citar como problema personal. Hasta la primavera de 2024 se nombraba como problema propio tanto o más que como problema del país. Desde {cruce} es al revés, y la distancia crece: en el último año, {esp_media} frente a {per_media}.

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

## cierre

Todos los datos de esta historia, mes a mes y por grupos, están en [*Barómetro a barómetro*](https://gastiaso.github.io/barometros/#vivienda), con su método y sus márgenes de error.

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
