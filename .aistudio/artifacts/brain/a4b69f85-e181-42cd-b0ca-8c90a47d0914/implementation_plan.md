# Radar de Clientes — Plan de Implementación (Mercado Colombia)

Aplicación web profesional de prospección y prospección B2B orientada a la venta de servicios digitales (sitios web modernos, agentes de IA por WhatsApp y sistemas de reservas/citas automatizadas) a negocios locales en Colombia, con modo 100% gratuito basado en Gemini con búsqueda web y rastreo de decisores, y compatibilidad con Google Cloud API (Places New + PageSpeed v5).

---

## Decisiones Críticas y Preferencias Confirmadas

> [!IMPORTANT]
> - **Modo de Búsqueda Gratuito Activo por Defecto**: Dado que no se desea incurrir en costes de Google Cloud Console ni configurar facturación bancaria por ahora, el motor principal de búsqueda y prospección funcionará mediante **Gemini 3.8 Flash con Búsqueda Web y Grounding** desde el backend seguro de la aplicación. En la pantalla de **Ajustes**, el usuario podrá activar el modo Google Cloud (Places New + PageSpeed Insights) si en el futuro adquiere la clave.
> - **Rastreo Profundo de Decisores (Dueño / Gerente)**: La IA analizará la información pública del negocio, páginas "Quiénes Somos / Contacto" y redes para identificar el nombre o cargo del decisor y su canal directo de WhatsApp.
> - **Mercado Colombia Priorizado**: Formateo automático de teléfonos con prefijo `+57`, enlaces directos a `https://wa.me/57...` con mensaje prellenado, y accesos rápidos para **Bogotá, Medellín, Cali, Barranquilla y Bucaramanga**, además de campo libre para cualquier municipio del país.
> - **Toda la interfaz en Español**: Terminología clara, profesional y libre de jerga innecesaria.

---

## 1. Visión General y Flujo de Trabajo

### ¿Qué hace la aplicación?
Permite a una agencia o consultor digital encontrar negocios locales en cualquier ciudad o municipio de Colombia, evaluar al instante su nivel de digitalización (si carecen de web, si tienen web lenta o sin WhatsApp, o si solo usan Instagram/Facebook), descubrir quién toma las decisiones, y generar en 1 clic los 3 borradores de prospección personalizada (Llamada de 30s, WhatsApp y Correo) adaptados a las debilidades reales detectadas.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE PROSPECCIÓN                            │
│                                                                        │
│  [1. BUSCAR]  ──> [2. EVALUAR OPORTUNIDAD] ──> [3. ANALIZAR WEB & IA]  │
│  Zona Colombia    Puntuación 0-100             Checklist + PageSpeed   │
│  + Nicho          Filtro "Sin Web" / WhatsApp  Rastreo de Decisor      │
│         │                                               │              │
│         ▼                                               ▼              │
│  [4. GUARDAR EN LEADS]                      [5. PRIMER CONTACTO]       │
│  Tablero Kanban / Tabla                     Guion 30s, WhatsApp y Mail │
│  Embudo de ventas hasta cierre              Exportar Ficha / PDF       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Pantallas y Experiencia de Usuario

### 1. Pantalla «Buscar»
- **Barra de Parámetros**:
  - Selector rápido de ciudades colombianas: **Bogotá, Medellín, Cali, Barranquilla, Bucaramanga** + entrada libre de texto (barrio, localidad o municipio: ej. *Poblado, Chapinero, San Alonso, Usaquén*).
  - Nicho con sugerencias desplegables: *Talleres mecánicos, Clínicas dentales, Fisioterapeutas, Peluquerías y barberías, Centros de estética, Restaurantes, Gimnasios, Academias, Inmobiliarias, Reformas y construcción, Veterinarias, Autoescuelas, Ópticas, Gestorías y consultorías contables*.
- **Filtros Rápidos**:
  - Solo sin web propia (incluyendo los que solo tienen Facebook, Instagram o Linktree).
  - Solo con teléfono / WhatsApp detectable.
  - Valoración mínima (ej. $\ge 4.0$ estrellas) y volumen de reseñas.
  - Ocultar negocios cerrados temporalmente.
- **Vistas Duales**: Tabla densa de prospección y tarjetas modulares con:
  - Nombre del negocio, rubro y dirección colombiana.
  - Teléfono directo y botón directo de WhatsApp (`wa.me/57...`).
  - Web o etiqueta destacada **«Sin web propia»** (o *«Solo Instagram/Linktree»*).
  - Puntuación de Oportunidad (0 a 100) con desglose en tooltip.
  - Nombre o rol del Decisor identificado preliminarmente.
- **Acciones en Lote**: Selección múltiple con casillas para:
  - *"Guardar seleccionados en Mis Leads"*
  - *"Analizar seleccionados en cola (máximo 2 en paralelo con barra de progreso)"*.

### 2. Pantalla «Ficha del Negocio»
- **Cabecera**: Datos de contacto completos, botón de llamada directa, botón de abrir WhatsApp directo en nueva pestaña, web oficial y enlace a Google Maps.
- **Datos del Decisor y Empresa**:
  - Nombre del dueño/gerente/administrador, cargo, perfil social (LinkedIn/Instagram empresarial) y canal de contacto preferente.
- **Auditoría Técnica y de Conversión**:
  - Resumen ejecutivo en 2 frases de la propuesta de valor del negocio.
  - **Checklist Crítico de Conversión**:
    - [ ] ¿Tiene protocolo HTTPS seguro?
    - [ ] ¿Está adaptada a teléfonos móviles?
    - [ ] ¿Tiene botón flotante de WhatsApp directo?
    - [ ] ¿Cuenta con sistema de citas o reservas online?
    - [ ] ¿Tiene formulario de contacto funcionando?
    - [ ] ¿Señales de abandono o copyright desactualizado? (ej. *© 2021*)
  - **Métricas de Rendimiento**: En modo Google Cloud muestra las 4 notas de PageSpeed (Rendimiento, SEO, Accesibilidad, Buenas Prácticas) con captura real; en modo gratuito con IA, Gemini evalúa la presencia digital y UX móvil.
  - **Diagnóstico en Lenguaje Llano**: 3 a 5 problemas claros que hacen perder clientes al negocio.
  - **Servicio Recomendado para Vender**: Selección justificada entre:
    1. *Página Web Moderna de Alta Conversión*
    2. *Agente de Inteligencia Artificial por WhatsApp (atención 24/7 y cualificación)*
    3. *Sistema Automatizado de Citas y Recordatorios*
- **Generador de Primer Contacto**:
  - **Guion de llamada telefónica de 30 segundos** (gancho directo, problema detectado, oferta de valor, cierre de reunión).
  - **Mensaje de WhatsApp** (formateado con negritas, emojis medidos y enlace de demo).
  - **Correo electrónico persuasivo** (asunto llamativo y cuerpo personalizado).
  - Selector de tono: *Profesional y directo, Consultivo y cercano, Enfocado en pérdida de clientes*.
  - Botón de copiar al portapapeles y aviso legal: *«Borradores para contactar de forma personal. No envíes mensajes comerciales masivos sin consentimiento»*.
- **Gestión Comercial**: Selector de estado, notas internas privadas y selector de fecha para la próxima acción de seguimiento.
- **Exportación**: Botón *«Exportar Ficha»* con formato limpio optimizado para imprimir o guardar en PDF.

### 3. Pantalla «Radar de Nichos»
- Permite escribir una ciudad o zona de Colombia y auditar una lista de categorías comerciales.
- Muestra métricas agregadas por nicho:
  - Cantidad de negocios analizados.
  - Porcentaje de negocios sin sitio web propio (o dependientes de redes sociales).
  - Calificación media en reseñas y volumen de actividad comercial.
- **Recomendación Inteligente de Gemini**:
  - Ordena los nichos de mayor a menor probabilidad de venta.
  - Destaca los **Top 3 Nichos de Oportunidad** explicando el porqué y qué producto venderles.
  - Botón *«Explorar negocios de este nicho»* que precarga la búsqueda en 1 clic.
- Indicador previo con confirmación antes de iniciar el escaneo de nichos.

### 4. Pantalla «Mis Leads»
- **Vista Tablero Kanban** por etapas de venta:
  - `Nuevo` ➔ `Analizado` ➔ `Contactado` ➔ `Respondió` ➔ `Reunión Agendada` ➔ `Cliente Cerrado` ➔ `Descartado`.
  - Tarjetas arrastrables o cambiables de estado rápidamente, mostrando puntuación, ciudad, decisor y último contacto.
- **Vista Tabla**: Ordenable por fecha, puntuación de oportunidad o nombre, con filtros por ciudad, nicho y estado comercial.
- **Exportación**: Descarga completa a formato CSV compatible con Excel y Google Sheets.

### 5. Pantalla «Ajustes»
- **Modo de Operación**:
  - Alternador entre *«Modo Gratuito Inteligente (Gemini IA)»* y *«Modo Google Cloud API (Places + PageSpeed)»*.
  - Entrada segura para Clave de API de Google Cloud (guardada únicamente en el navegador `localStorage` del usuario, sin exponerse).
- **Perfil del Vendedor / Agencia**:
  - Nombre del consultor o agencia.
  - Especialidad y catálogo de servicios ofrecidos.
  - Propuesta única de valor y tono de redacción por defecto.
- **Monitor de Cuota**:
  - Contador de consultas realizadas en el mes actual con alerta visual preventiva al alcanzar 800 de 1.000 operaciones.

---

## 3. Modelo de Datos y Arquitectura Técnica

### Arquitectura de Componentes y Servicios

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ARQUITECTURA DEL SISTEMA                        │
│                                                                        │
│  [ FRONTEND - React 19 + Tailwind v4 + Lucide Icons ]                  │
│  ├── App Layout (Sidebar 260px + Header + Views)                       │
│  ├── Vistas: Buscar | Ficha | Radar Nichos | Mis Leads | Ajustes       │
│  ├── Capa de Estado Local: Repositorio (IndexedDB / LocalStorage)      │
│  └── Adaptador de Datos (Listos para sincronizar con Firebase)         │
│                              │                                         │
│                     HTTP /api/gemini/*                                 │
│                              ▼                                         │
│  [ BACKEND PROXY - Express Server / Vite API Middleware ]              │
│  ├── /api/prospect: Búsqueda con Google Search Grounding en Colombia   │
│  ├── /api/enrich-business: Rastreo de decisor, web y WhatsApp          │
│  ├── /api/analyze-web: Auditoría web, checklist, dolores y servicio    │
│  ├── /api/generate-pitches: Guiones de llamada, WhatsApp y correo      │
│  └── /api/niche-radar: Comparativa de oportunidad por sectores         │
│                              │                                         │
│  [ SERVICIOS EXTERNOS ]      ▼                                         │
│  ├── Google GenAI SDK (gemini-3.8-flash) con server-side GEMINI_KEY    │
│  └── Opcional: Google Cloud Places & PageSpeed APIs (vía cliente/user) │
└────────────────────────────────────────────────────────────────────────┘
```

### Entidades de Datos Principales

```typescript
export interface BusinessLead {
  id: string;
  name: string;
  niche: string;
  city: string;
  neighborhood?: string;
  address: string;
  phone?: string;
  whatsappNumber?: string;
  whatsappLink?: string;
  websiteUri?: string;
  hasOwnWebsite: boolean; // false si es facebook, instagram, linktree o vacío
  websiteType: 'none' | 'social_or_directory' | 'own_website';
  googleMapsUri?: string;
  rating?: number;
  userRatingCount?: number;
  businessStatus?: 'OPERATIONAL' | 'CLOSED_TEMPORARILY' | 'CLOSED_PERMANENTLY';
  
  // Decisor
  decisionMaker?: {
    name?: string;
    role?: string; // Dueño, Gerente, Director, Administrador
    source?: string; // Web, Redes, Registro
    linkedinUrl?: string;
    verified: boolean;
  };

  // Puntuación de Oportunidad (0 - 100)
  opportunityScore: number;
  scoreBreakdown: {
    noWebsiteBonus: number;        // +40 si no tiene web o es red social
    lacksWhatsAppBonus: number;    // +15 si la web no tiene botón de WhatsApp
    lacksBookingBonus: number;     // +15 si no tiene sistema de reservas
    lowSpeedBonus: number;         // +10 si el rendimiento móvil es deficiente
    highActivityBonus: number;     // +20 si tiene buena clientela y reseñas
  };

  // Análisis Web & IA
  analysis?: {
    analyzedAt: string;
    summary: string;
    checklist: {
      hasHttps: boolean;
      mobileFriendly: boolean;
      hasWhatsAppButton: boolean;
      hasOnlineBooking: boolean;
      hasContactForm: boolean;
      outdatedCopyright: boolean;
      detectedYear?: number;
    };
    pageSpeedScores?: {
      performance: number;
      seo: number;
      accessibility: number;
      bestPractices: number;
      screenshotBase64?: string;
    };
    detectedEmails: string[];
    detectedSocials: { network: string; url: string }[];
    painPoints: string[];
    recommendedService: 'website' | 'whatsapp_agent' | 'booking_system';
    recommendedReason: string;
  };

  // Borradores de Contacto Personalizado
  contactPitches?: {
    callScript30s: string;
    whatsappMessage: string;
    emailPitch: { subject: string; body: string };
    tone: 'consultive' | 'direct' | 'loss_aversion';
  };

  // Gestión CRM
  status: 'new' | 'analyzed' | 'contacted' | 'replied' | 'meeting' | 'won' | 'discarded';
  notes: string;
  nextFollowUpDate?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Algoritmo de Puntuación de Oportunidad (0 a 100)

La puntuación representa matemáticamente qué tan viable y rentable es venderle a ese negocio:
1. **Presencia Web (+40 pts)**:
   - Sin web o solo perfil en Instagram/Facebook/Linktree: **+40 puntos** (máxima necesidad de una web profesional).
   - Con web propia existente: **0 puntos** de base, pero se suman puntos si tiene fallas graves.
2. **Deficiencias de Conversión en su Web (+30 pts)**:
   - Si tiene web pero carece de botón flotante de WhatsApp: **+15 puntos** (ideal para vender Agente IA o botón).
   - Si no dispone de sistema de reservas/citas online: **+15 puntos** (ideal para vender motor de citas).
3. **Salud y Desactualización (+10 pts)**:
   - Web lenta (PageSpeed móvil < 50) o sin HTTPS o copyright desactualizado (> 2 años): **+10 puntos**.
4. **Validación Comercial y Actividad (+20 pts)**:
   - Negocio activo con > 15 reseñas y valoración > 4.0: **+20 puntos**. Un negocio con clientela tiene dinero para invertir en software; un negocio abandonado o cerrado no comprará.

---

## 5. Orden de Construcción

1. **Configuración del Servidor y Proxy API**:
   - Crear servidor seguro con endpoints `/api/prospect`, `/api/analyze`, `/api/enrich` y `/api/radar` usando `@google/genai` con el modelo `gemini-3.8-flash` y soporte para Google Search Grounding.
2. **Capa de Almacenamiento Local (Data Repository)**:
   - Crear servicio TypeScript modular con persistencia en `localStorage` / `IndexedDB`, con caché de búsquedas y preparado para migración a Firebase.
3. **Componentes Base y Sistema de Diseño**:
   - Barra lateral con navegación a las 5 vistas, sistema de colores de oportunidad (verde, ámbar, rojo con `tabular-nums`), badges limpios sin degradados genéricos y modales de confirmación.
4. **Pantalla «Buscar» y Vista Rápida**:
   - Búsqueda por ciudades colombianas, filtros avanzados, vistas de tabla y tarjetas, selección múltiple y cálculo en tiempo real de puntuación de oportunidad.
5. **Pantalla «Ficha del Negocio» y Auditoría**:
   - Vista de detalle con checklist técnico, rastreo de decisores, recomendación de servicio y generación de los 3 borradores (llamada, WhatsApp y correo) con botón de copiado.
6. **Pantalla «Radar de Nichos»**:
   - Análisis comparativo de sectores comerciales en Colombia con ranking de IA y sugerencias de oferta.
7. **Pantalla «Mis Leads» (Kanban + Tabla)**:
   - Gestión de prospectos por estados, notas, filtros y exportación a CSV.
8. **Pantalla «Ajustes» y Verificación Final**:
   - Configuración de perfil comercial, conmutador de modo gratis / Google Cloud y pruebas de compilación completas.
