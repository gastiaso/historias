# Datos del monográfico de vivienda del CIS (estudio 3532, Barómetro de Vivienda 2026) para la historia.
#
# Uso, desde la carpeta historias:
#   Rscript datos/preparar_monografico.R RUTA/3532-multi_A.xlsx [RUTA/3532-multi01_A.xlsx]
#
# Lee el Excel público del avance de resultados (marginales y cruces) y escribe
# static/datos/vivienda/monografico.json. El segundo fichero (submuestra de los 36 municipios
# especiales) es opcional: añade el grupo «Grandes ciudades».
#
# Método:
#   - Cada bloque del Excel da porcentajes por columna y la base ponderada «(N)». Se reconstruyen los
#     conteos ponderados (porcentaje × base), así que agrupar columnas es exacto: 65-74 y 75 y más dan
#     «65 y más»; los diez puntos de la escala ideológica, los cinco tramos de los barómetros.
#   - Margen al 95 % con el intervalo de Wilson sobre el tamaño efectivo, base / DEFF.
#   - DEFF: sin microdatos no se puede calcular. Se estima con la fórmula de Kish a partir de la sobremuestra:
#     3.270 de las 6.019 entrevistas son de los 36 municipios especiales, que tienen alrededor de una cuarta
#     parte de la población (ficha técnica). Eso da 1,35. Es una aproximación: la calibración lo sube algo.
#   - No se da ningún dato con una base menor de 50.
#
# Requiere los paquetes readxl y jsonlite.

suppressPackageStartupMessages({
  library(readxl)
  library(jsonlite)
})

# Fecha de publicación del avance de resultados en la web del CIS. La historia se ancla a esta versión:
# si el CIS publica resultados definitivos o microdatos, no se recalcula (sería otra edición).
PUBLICACION_AVANCE <- "2026-10-08"

N_MUNICIPIOS_ESPECIALES <- 3270
PESO_POBLACION_ESPECIALES <- 0.25
N_MINIMO <- 50

EDAD <- list(
  "18-24" = "De 18 a 24 años", "25-34" = "De 25 a 34 años", "35-44" = "De 35 a 44 años",
  "45-54" = "De 45 a 54 años", "55-64" = "De 55 a 64 años", "65 y más" = c("De 65 a 74 años", "75 y más años")
)
EDAD2 <- list("18-34" = c("De 18 a 24 años", "De 25 a 34 años"), "65 y más" = c("De 65 a 74 años", "75 y más años"))
IDEO <- list(
  "Izquierda (1-2)" = c("1 Izquierda", "2"), "Centro izquierda (3-4)" = c("3", "4"), "Centro (5-6)" = c("5", "6"),
  "Centro derecha (7-8)" = c("7", "8"), "Derecha (9-10)" = c("9", "10 Derecha")
)

# Indicadores de una sola pregunta: qué categorías cuentan (por el principio de su texto).
INDICADORES <- list(
  preocupa   = list(p = "1",  cats = c("Mucho", "Bastante"), que = "Le preocupa mucho o bastante la situación de la vivienda en España"),
  perjudica  = list(p = "2",  cats = "Le está perjudicando", que = "La situación de la vivienda le está perjudicando"),
  propiedad  = list(p = "15", cats = "En propiedad", que = "Prefiere vivir en una vivienda en propiedad"),
  heredar    = list(p = "16", cats = "Sí", que = "Tiene perspectivas de heredar una vivienda"),
  derecho    = list(p = "20", cats = "El derecho a la vivienda", que = "Prioriza la vivienda como derecho frente a bien de mercado"),
  intervenir = list(p = "21", cats = "El Estado debe intervenir", que = "Cree que el Estado debe intervenir en el mercado de la vivienda"),
  mas_publica = list(p = "22", cats = "Sí", que = "Cree que hace falta más vivienda pública")
)

# Situaciones vividas en los últimos cinco años (P19): identificador, principio del texto y rótulo corto.
SITUACIONES <- list(
  impago_alquiler     = c("No ha podido pagar el alquiler", "No poder pagar el alquiler"),
  impago_hipoteca     = c("No ha podido pagar la hipoteca", "No poder pagar la hipoteca"),
  mudarse_impago      = c("Se ha tenido que mudar de casa por no poder", "Mudarse por no poder pagar"),
  volver_familia      = c("Ha tenido que volver a vivir con su familia", "Volver con la familia o a compartir piso"),
  presiones           = c("Ha sufrido presiones o avisos", "Presiones para dejar la vivienda"),
  discrim_orientacion = c("Se ha sentido discriminado/a por su identidad", "Discriminación por orientación o identidad"),
  discrim_edad        = c("Se ha sentido discriminado/a por su edad", "Discriminación por la edad"),
  discrim_genero      = c("Se ha sentido discriminado/a por su género", "Discriminación por género"),
  discrim_origen      = c("Se ha sentido discriminado/a por su nacionalidad", "Discriminación por origen"),
  subida_alquiler     = c("Le han subido el alquiler", "Subida del alquiler por encima de la inflación"),
  discrim_moroso      = c("Se ha sentido discriminado/a por ser considerado", "Tratado como posible moroso"),
  frio_calor          = c("Ha vivido en una vivienda con frío", "Frío o calor extremo en casa"),
  sin_ventana         = c("Ha vivido en una habitación sin ventana", "Habitación sin ventana"),
  practicas_ilegales  = c("Ha sufrido prácticas ilegales", "Prácticas ilegales de inmobiliarias"),
  mudarse_lejos       = c("Se ha tenido que mudar lejos", "Mudarse lejos de familia o amigos por precio"),
  ayuda_familia       = c("Ha recibido ayuda económica de su familia", "Ayuda de la familia para pagar"),
  ayuda_admin         = c("Ha recibido ayuda económica de alguna Administración", "Ayuda de la Administración para pagar"),
  sin_contrato        = c("Ha estado alquilado/a sin contrato", "Alquiler sin contrato")
)

# Cruces del desglose de las medidas: hoja del Excel, nombre, nota y grupos (rótulo = columnas del CIS que suma).
# Las columnas de N.S., N.C. y N.R. no se muestran, salvo en ideología («No se ubica»). Los grupos con
# menos de 50 entrevistas se quedan sin dato.
CRUCES <- list(
  sexo = list(hoja = "Sexo", nombre = "Sexo", nota = "", grupos = list("Hombres" = "Hombre", "Mujeres" = "Mujer")),
  edad = list(hoja = "Edad", nombre = "Edad", nota = "", grupos = list(
    "De 18 a 24 años" = "De 18 a 24 años", "De 25 a 34 años" = "De 25 a 34 años", "De 35 a 44 años" = "De 35 a 44 años",
    "De 45 a 54 años" = "De 45 a 54 años", "De 55 a 64 años" = "De 55 a 64 años", "De 65 a 74 años" = "De 65 a 74 años",
    "75 años y más" = "75 y más años")),
  estudios = list(hoja = "Nivel de estudios", nombre = "Estudios", nota = "", grupos = list(
    "Sin estudios" = "Sin estudios", "Primaria" = "Primaria", "Secundaria, primera etapa" = "Secundaria 1ª etapa",
    "Secundaria, segunda etapa" = "Secundaria 2ª etapa", "Formación profesional" = "F.P.", "Superiores" = "Superiores",
    "Otros" = "Otros")),
  municipio = list(hoja = "Tamaño de municipio", nombre = "Tamaño del municipio", nota = "", grupos = list(
    "Hasta 2.000 habitantes" = "Menos o igual a 2.000 habitantes", "De 2.001 a 10.000" = "2.001 a 10.000 habitantes",
    "De 10.001 a 50.000" = "10.001 a 50.000 habitantes", "De 50.001 a 100.000" = "50.001 a 100.000 habitantes",
    "De 100.001 a 400.000" = "100.001 a 400.000 habitantes", "De 400.001 a 1.000.000" = "400.001 a 1.000.000 habitantes",
    "Más de 1.000.000" = "Más de 1.000.000 habitantes")),
  voto = list(hoja = "RV EG23", nombre = "Recuerdo de voto",
    nota = "Voto en las elecciones generales de 2023, según lo recuerdan. Solo personas con nacionalidad española.",
    grupos = list(
      "PP" = "PP", "PSOE" = "PSOE", "Vox" = "VOX", "Sumar" = "Sumar", "ERC" = "ERC", "Junts" = "Junts", "EH Bildu" = "EH Bildu",
      "PNV" = "EAJ-PNV", "BNG" = "BNG", "Coalición Canaria" = "CCa", "UPN" = "UPN", "PACMA" = "PACMA", "Otro partido" = "Otro partido",
      "En blanco" = "En blanco", "Nulo" = "Nulo", "No votó" = "No votó", "No tenía edad" = "No tenía edad",
      "No tenía derecho a voto" = "No tenía derecho a voto")),
  ocupacion = list(hoja = "Ocupación", nombre = "Ocupación", nota = "Ocupación de quien trabaja; situación de quien no trabaja.", grupos = list(
    "Directivos y gerentes" = "Directores/as y gerentes",
    "Profesionales científicos e intelectuales" = "Profesionales, científicos/as e intelectuales",
    "Técnicos y profesionales de nivel medio" = "Técnicos/as y profesionales de nivel medio",
    "Apoyo administrativo" = "Personal de apoyo administrativo",
    "Servicios y comercio" = "Trabajadores/as de los servicios y vendedores/as de comercios y mercados",
    "Agricultura, ganadería y pesca" = "Agricultores/as y trabajadores/as agropecuarios/as, forestales y pesqueros/as",
    "Oficiales, operarios y artesanos" = "Oficiales/as, operarios/as y artesanos/as",
    "Operadores de máquinas" = "Operadores/as de instalaciones y máquinas y ensambladores/as",
    "Ocupaciones elementales" = "Ocupaciones elementales",
    "Militares y policías" = "Ocupaciones militares y cuerpos policiales",
    "Jubilados y pensionistas" = "Jubilado o pensionista (anteriormente ha trabajado)",
    "Estudiantes" = "Estudiante", "Trabajo doméstico no remunerado" = "Trabajo doméstico no remunerado",
    "Otra situación inactiva" = "Otra situación inactiva", "En paro" = "Parados/as")),
  clase = list(hoja = "Clase social", nombre = "Clase social", nota = "Clase con la que se identifica la persona entrevistada.", grupos = list(
    "Alta y media alta" = "Clase alta y media alta", "Media-media" = "Clase media-media", "Media-baja" = "Clase media-baja",
    "Trabajadora" = "Clase trabajadora/obrera/proletariado", "Baja o pobre" = "Clase baja/pobre", "Otras" = "Otras")),
  ideologia = list(hoja = "Escala de ideología", nombre = "Ideología", nota = "Autoubicación en la escala de 1 (izquierda) a 10 (derecha).",
    grupos = c(IDEO, list("No se ubica" = c("N.S.", "N.C.")))),
  religiosidad = list(hoja = "Religiosidad", nombre = "Religiosidad", nota = "", grupos = list(
    "Católicos practicantes" = "Católico/a practicante", "Católicos no practicantes" = "Católico/a no practicante",
    "Creyentes de otra religión" = "Creyente de otra religión", "Agnósticos" = "Agnóstico/a",
    "Indiferentes, no creyentes" = "Indiferente, no creyente", "Ateos" = "Ateo/a"))
)

# Medidas (P24): identificador, principio del texto y rótulo corto.
MEDIDAS <- list(
  congelar            = c("Congelar los precios del alquiler", "Congelar el alquiler dos años"),
  turisticos          = c("Limitar los pisos turísticos", "Limitar los pisos turísticos"),
  expropiar_suelo     = c("Expropiar el suelo", "Expropiar suelo para vivienda pública"),
  expropiar_vacias    = c("Expropiar las viviendas vacías", "Expropiar viviendas vacías"),
  impuestos_tenedores = c("Subir los impuestos a los grandes tenedores", "Más impuestos a grandes tenedores"),
  impuestos_primera   = c("Bajar impuestos en la compra", "Menos impuestos en la primera compra"),
  recuperar_publica   = c("Recuperar viviendas públicas", "Recuperar vivienda pública vendida"),
  suelo_urbanizable   = c("Sacar al mercado el suelo", "Sacar suelo urbanizable al mercado"),
  garantias_caseros   = c("Dar más garantías a caseros", "Más garantías a los caseros"),
  empresa_publica     = c("Crear una empresa pública", "Empresa pública estatal de vivienda")
)

# --------------------------------------------------------------------------------------------- lectura

#' Bloques de una hoja de cruce: pregunta, ítem (en las baterías), columnas, categorías,
#' conteos ponderados (categorías × columnas) y base ponderada de cada columna.
leer_hoja <- function(ruta, hoja) {
  x <- as.matrix(read_excel(ruta, sheet = hoja, col_names = FALSE, col_types = "text", .name_repair = "minimal"))
  c1 <- x[, 1]
  bloques <- list()
  pregunta <- NA_character_
  texto <- NA_character_
  i <- 1
  while (i <= nrow(x)) {
    if (!is.na(c1[i]) && grepl("^Pregunta ", c1[i])) {
      pregunta <- sub("^Pregunta ", "", c1[i])
      texto <- x[i + 1, 1]
      i <- i + 2
      next
    }
    if (!is.na(x[i, 2]) && x[i, 2] == "TOTAL") {
      cols <- x[i, -1]
      cols <- cols[!is.na(cols)]
      k <- seq_along(cols) + 1
      item <- if (!is.na(c1[i - 1]) && !identical(c1[i - 1], texto)) c1[i - 1] else NA_character_
      j <- i + 1
      cats <- character(0)
      filas <- list()
      while (j <= nrow(x) && !identical(c1[j], "(N)")) {
        cats <- c(cats, c1[j])
        filas[[length(filas) + 1]] <- as.numeric(x[j, k])
        j <- j + 1
      }
      if (j > nrow(x)) stop("Bloque sin fila (N): pregunta ", pregunta, ", hoja ", hoja)
      n <- as.numeric(x[j, k])
      pct <- do.call(rbind, filas)
      pct[is.na(pct)] <- 0
      cuentas <- sweep(pct / 100, 2, n, `*`)
      colnames(cuentas) <- cols
      names(n) <- cols
      bloques[[length(bloques) + 1]] <- list(pregunta = pregunta, texto = texto, item = item, cats = cats, cuentas = cuentas, n = n)
      i <- j + 1
      next
    }
    i <- i + 1
  }
  bloques
}

buscar <- function(bloques, p, item = NULL) {
  b <- Filter(function(b) identical(b$pregunta, p) && (is.null(item) || (!is.na(b$item) && startsWith(b$item, item))), bloques)
  if (length(b) != 1) stop("Se esperaba un bloque para la pregunta ", p, if (!is.null(item)) paste0(" («", item, "»)"), " y hay ", length(b))
  b[[1]]
}

filas_de <- function(b, cats) {
  f <- unlist(lapply(cats, function(c) which(startsWith(b$cats, c))))
  if (length(f) != length(cats)) stop("Categorías no encontradas en la pregunta ", b$pregunta, ": ", paste(cats, collapse = ", "))
  f
}

# --------------------------------------------------------------------------------------------- cálculo

wilson <- function(p, n) {
  z <- 1.96
  c0 <- (p + z^2 / (2 * n)) / (1 + z^2 / n)
  h <- z * sqrt(p * (1 - p) / n + z^2 / (4 * n^2)) / (1 + z^2 / n)
  c(max(0, c0 - h), min(1, c0 + h))
}

DEFF <- local({
  n <- 6019
  n1 <- N_MUNICIPIOS_ESPECIALES
  p1 <- PESO_POBLACION_ESPECIALES
  n * (p1^2 / n1 + (1 - p1)^2 / (n - n1))
})

#' Porcentaje de las categorías elegidas en un grupo de columnas, con su margen.
medir <- function(b, cats, columnas) {
  if (!all(columnas %in% colnames(b$cuentas))) stop("Columnas no encontradas: ", paste(setdiff(columnas, colnames(b$cuentas)), collapse = ", "))
  n <- sum(b$n[columnas])
  if (n < N_MINIMO) return(list(n = round(n), v = NULL, lo = NULL, hi = NULL))
  p <- sum(b$cuentas[filas_de(b, cats), columnas]) / n
  ic <- wilson(p, n / DEFF)
  list(n = round(n), v = round(100 * p, 1), lo = round(100 * ic[1], 1), hi = round(100 * ic[2], 1))
}

por_grupos <- function(b, cats, grupos) {
  lapply(names(grupos), function(g) c(list(g = g), medir(b, cats, grupos[[g]])))
}

#' Un indicador en el total, por edad, por edad agrupada, por ideología y, si hay, en las grandes ciudades.
indicador <- function(hojas, p, cats, item = NULL, especiales = NULL) {
  bt <- buscar(hojas$Edad, p, item)
  r <- list(
    total = medir(bt, cats, "TOTAL"),
    edad = por_grupos(bt, cats, EDAD),
    edad2 = por_grupos(bt, cats, EDAD2),
    ideologia = por_grupos(buscar(hojas$Ideologia, p, item), cats, IDEO)
  )
  if (!is.null(especiales)) r$grandes_ciudades <- medir(buscar(especiales, p, item), cats, "TOTAL")
  r
}

# --------------------------------------------------------------------------------------------- principal

args <- commandArgs(TRUE)
if (length(args) < 1) stop("Uso: Rscript datos/preparar_monografico.R RUTA/3532-multi_A.xlsx [RUTA/3532-multi01_A.xlsx]")
ruta <- args[1]
hojas <- list(Edad = leer_hoja(ruta, "Edad"), Ideologia = leer_hoja(ruta, "Escala de ideología"))
hojas_cruce <- lapply(CRUCES, function(cr) leer_hoja(ruta, cr$hoja))
especiales <- if (length(args) >= 2) leer_hoja(args[2], "Sexo") else NULL

indicadores <- lapply(names(INDICADORES), function(id) {
  d <- INDICADORES[[id]]
  b <- buscar(hojas$Edad, d$p)
  c(list(id = id, pregunta = paste0("P", d$p), texto = b$texto, que = d$que), indicador(hojas, d$p, d$cats, especiales = especiales))
})
names(indicadores) <- names(INDICADORES)

situaciones <- lapply(names(SITUACIONES), function(id) {
  s <- SITUACIONES[[id]]
  b <- buscar(hojas$Edad, "19", s[1])
  c(list(id = id, texto = b$item, corto = s[2]), indicador(hojas, "19", "Sí", s[1], especiales))
})

medidas <- lapply(names(MEDIDAS), function(id) {
  m <- MEDIDAS[[id]]
  b <- buscar(hojas$Edad, "24", m[1])
  favor <- indicador(hojas, "24", "A favor", m[1])
  contra <- indicador(hojas, "24", "En contra", m[1])
  neto <- function(a, b) if (is.null(a$v) || is.null(b$v)) NULL else round(a$v - b$v, 1)
  sin_n <- function(x) x[c("v", "lo", "hi")]
  # Desglose: cada medida en cada grupo de cada cruce
  desglose <- lapply(names(CRUCES), function(k) {
    cr <- CRUCES[[k]]
    bc <- buscar(hojas_cruce[[k]], "24", m[1])
    lapply(names(cr$grupos), function(g) {
      f <- medir(bc, "A favor", cr$grupos[[g]])
      c <- medir(bc, "En contra", cr$grupos[[g]])
      list(g = g, n = f$n, favor = sin_n(f), contra = sin_n(c), neto = neto(f, c))
    })
  })
  names(desglose) <- names(CRUCES)
  list(
    id = id, texto = b$item, corto = m[2],
    favor = favor$total, contra = contra$total, neto = neto(favor$total, contra$total),
    ideologia = Map(function(f, c) list(g = f$g, favor = f$v, contra = c$v, neto = neto(f, c)), favor$ideologia, contra$ideologia),
    desglose = desglose
  )
})

# Comprobar que no falta ningún ítem de las baterías
for (p in c("19", "24")) {
  todos <- unique(na.omit(vapply(Filter(function(b) identical(b$pregunta, p), hojas$Edad), `[[`, "", "item")))
  usados <- if (p == "19") vapply(SITUACIONES, `[`, "", 1) else vapply(MEDIDAS, `[`, "", 1)
  sobran <- todos[!vapply(todos, function(t) any(startsWith(t, usados)), TRUE)]
  if (length(sobran)) stop("Ítems de P", p, " sin identificador: ", paste(sobran, collapse = " | "))
}

salida <- list(
  meta = list(
    estudio = "3532", titulo = "Barómetro de Vivienda 2026", nivel = "avance de resultados (tabulaciones del CIS)",
    publicacion = PUBLICACION_AVANCE,
    campo = list(desde = "2026-06-22", hasta = "2026-06-30"), mes = "2026-06", entrevistas = 6019,
    deff = round(DEFF, 3), n_minimo = N_MINIMO,
    fichero = basename(ruta), md5 = unname(tools::md5sum(ruta))
  ),
  indicadores = indicadores,
  situaciones = situaciones,
  medidas = medidas,
  cruces = lapply(names(CRUCES), function(k) list(id = k, nombre = CRUCES[[k]]$nombre, nota = CRUCES[[k]]$nota))
)

destino <- file.path("static", "datos", "vivienda", "monografico.json")
dir.create(dirname(destino), recursive = TRUE, showWarnings = FALSE)
writeLines(toJSON(salida, auto_unbox = TRUE, null = "null", digits = NA, pretty = FALSE), destino, useBytes = TRUE)
cat("Escrito", destino, "· DEFF", round(DEFF, 3), "·", length(situaciones), "situaciones ·", length(medidas), "medidas\n")
