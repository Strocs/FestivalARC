# 📋 PLAN DE REFACTORIZACIÓN UI SCHEDULE - ZUSTAND OPTIMIZATION

## 🎯 OBJETIVO GENERAL

Optimizar el módulo `src/features/schedule/ui/` reemplazando estado local fragmentado por stores centralizados con Zustand, eliminando re-renders innecesarios y mejorando el performance general sin afectar la usabilidad.

## 📐 REGLAS GENERALES

### 🚦 **REGLA DE APROBACIÓN OBLIGATORIA**

**⚠️ NO AVANZAR A LA SIGUIENTE FASE SIN APROBACIÓN EXPLÍCITA DEL USUARIO ⚠️**

- Cada fase debe ser **consultada y aprobada** antes de continuar
- El agente debe **esperar confirmación** del usuario después de completar cada fase
- Nunca asumir que se debe continuar automáticamente

### 🔒 **REGLA DE TESTING OBLIGATORIA**

**Antes de cada fase, SIEMPRE crear los archivos de test correspondientes:**

1. ✅ **Pre-Fase**: Crear tests que validen el comportamiento actual
2. ✅ **Durante Refactor**: Los tests deben pasar con implementación actual Y nueva
3. ✅ **Post-Fase**: Todos los tests deben pasar sin modificaciones
4. ✅ **Cobertura**: Cada store, hook y función debe tener su test correspondiente

**⚠️ NOTA SOBRE TIMEOUTS EN TESTS:**

- Actualmente los tests usan `userEvent.setup({ delay: null })` para evitar timeouts
- Esto es una solución temporal debido a la complejidad de montaje de componentes
- En FASE 2-ALT se debe verificar que las optimizaciones permitan usar delays reales
- Objetivo: Tiempo de montaje de ScheduleGrid <200ms con delays habilitados

### 🚫 **RESTRICCIONES**

- ❌ **NO tocar estilos** (className, style props intactos)
- ❌ **NO tocar código fuera de `ui/`** (core, models, layouts)
- ❌ **NO dar soporte a código legacy** (eliminar patrones obsoletos)
- ❌ **NO cambios de usabilidad** (UX idéntica)

### ✅ **PRINCIPIOS**

- ✅ **Refactorizaciones progresivas** (no breaking changes)
- ✅ **Componentes sin lógica** (solo importar funcionalidad)
- ✅ **Testing continuo** (`pnpm build && pnpm test` después de cada fase)
- ✅ **Commits atómicos** (un commit por fase)

---

## 🚀 FASES DE REFACTORIZACIÓN

### **FASE 0: Setup Inicial** ⚙️ ✅

**Objetivo**: Instalar Zustand y crear estructura base

**Issues que resuelve**: Setup de infraestructura

**Estado**: ✅ **COMPLETADA**

#### 📋 TODO LIST - FASE 0

- [x] **Testing Pre-Fase**
  - [x] Crear `src/features/schedule/ui/__tests__/setup.test.tsx`
  - [x] Test que valide que todos los componentes renderizan sin errores
  - [x] Test de integración básica de ScheduleGrid
  - [x] Ejecutar `pnpm test` - debe pasar (5/5 tests pasando)

- [x] **Instalación**
  - [x] Ejecutar `pnpm add zustand`
  - [x] Verificar que se agregó a package.json (v5.0.8 instalada)

- [x] **Estructura Base**
  - [x] Crear directorio `src/features/schedule/ui/stores/`
  - [x] Crear `src/features/schedule/ui/stores/types.ts`
  - [x] Definir interfaces base para stores (NavigationStore, StageSelectionStore, ScrollStore, UIStore)

- [x] **Testing Post-Fase**
  - [x] Ejecutar `pnpm build` - debe pasar
  - [x] Ejecutar `pnpm test` - debe pasar (67/68 tests - 1 pre-existente fallando en core/)
  - [x] Verificar que no hay errores en consola

**Archivos creados**:

- ✨ `stores/types.ts`
- ✨ `__tests__/setup.test.ts`

**Tiempo estimado**: 30 minutos

---

### **FASE 1: Store de Navegación (Days)** 🗂️ ✅

**Objetivo**: Centralizar navegación de días

**Issues que resuelve**: Navegación de días fragmentada

**Estado**: ✅ **COMPLETADA**

#### 📋 TODO LIST - FASE 1

- [x] **Testing Pre-Fase**
  - [x] Crear `src/features/schedule/ui/__tests__/stores/navigation-store.test.ts`
  - [x] Tests para useDaySelection hook actual
  - [x] Tests para lógica de navegación en ScheduleGrid
  - [x] Crear `src/features/schedule/ui/__tests__/hooks/use-navigation.test.ts`
  - [x] Ejecutar tests - deben pasar con implementación actual

- [x] **Implementación Store**
  - [x] Crear `stores/navigation-store.ts`
    - [x] Estado: `currentDayIndex`, `totalDays`
    - [x] Acciones: `setDay`, `nextDay`, `prevDay`
    - [x] Derivados: `canGoNextDay`, `canGoPrevDay`
  - [x] Crear `hooks/use-navigation.ts` (wrapper tipado)

- [x] **Refactoring ScheduleGrid**
  - [x] Eliminar `useDaySelection()` import
  - [x] Integrar `useNavigation()` para day navigation

- [x] **Refactoring DaySelector**
  - [x] Eliminar props `currentDayIndex`, `onDayChange`
  - [x] Usar `useNavigation()` directamente
  - [x] Verificar que navegación funciona igual

- [x] **Limpieza**
  - [x] Eliminar `hooks/use-day-selection.ts`
  - [x] Verificar que no hay imports rotos

- [x] **Testing Post-Fase**
  - [x] Todos los tests de navegación deben pasar
  - [x] Ejecutar `pnpm build` - debe pasar (0 errors, 0 warnings)
  - [x] Ejecutar `pnpm test` - debe pasar (82/82 tests)
  - [x] Testing manual: navegación de días funciona idéntica

**Archivos afectados**:

- ✨ `stores/navigation-store.ts` (nuevo)
- ✨ `hooks/use-navigation.ts` (nuevo)
- 🔧 `components/grid/ScheduleGrid.tsx` (refactor)
- 🔧 `components/sidebar/DaySelector.tsx` (refactor)
- 🗑️ `hooks/use-day-selection.ts` (eliminar)

**Impacto esperado**: 30-40% mejora en renders de navegación

**Tiempo estimado**: 1.5 horas

---

### **FASE 2-ALT: Column Management Store - Arquitectura Unificada** 🎯

**Objetivo**: Centralizar TODA la lógica relacionada con columnas en un único store

**Issues que resuelve**: CRÍTICO #1, #2, #3, #4A, #4B, #7

**Estado**: ⏳ **PENDIENTE**

**Detalles**: Ver [PLAN-FASE-2.md](./PLAN-FASE-2.md) para arquitectura completa y pasos detallados

#### 📋 TODO LIST SIMPLIFICADO - FASE 2-ALT

- [ ] **1. Tests Primero (TDD)**
  - [ ] Crear tests del store unificado (`schedule-columns-store.test.ts`)
  - [ ] Crear tests del hook wrapper (`use-schedule-columns.test.ts`)
  - [ ] Definir comportamiento esperado de filtrado + navegación + auto-ajuste

- [ ] **2. Implementar Store Unificado**
  - [ ] Crear `stores/schedule-columns-store.ts` con:
    - Estado: `allColumns`, `selectedStageIds`, `currentIndex`
    - Derived: `filteredColumns`, `canGoNext`, `canGoPrev`, etc.
    - Acciones: Filtrado (toggle, selectAll) + Navegación (next, prev, selectStage)
  - [ ] Crear `hooks/use-schedule-columns.ts` (wrapper del store)

- [ ] **3. Refactorizar Componentes (Simplificación Masiva)**
  - [ ] ScheduleGrid: Eliminar 86 líneas de `useEffect`, usar `useScheduleColumns()`
  - [ ] use-horizontal-scroll: Recibir `currentIndex` + callbacks en lugar de estado interno
  - [ ] StageSelection: Usar store/props para selección
  - [ ] NavigationButtons: Recibir callbacks + estados del hook
  - [ ] StageNavigator: Usar `selectStage` del hook

- [ ] **4. Limpieza**
  - [ ] Eliminar `stores/stage-selection-store.ts`
  - [ ] Eliminar `hooks/use-stage-selection.ts`
  - [ ] Eliminar `hooks/use-stage-actions.ts`

- [ ] **5. Testing Post-Fase**
  - [ ] Todos los tests pasan
  - [ ] `pnpm build` sin errores
  - [ ] Testing manual: filtrado + navegación + localStorage

**Archivos principales**:

- ✨ `stores/schedule-columns-store.ts` (nuevo ~250 líneas)
- ✨ `hooks/use-schedule-columns.ts` (nuevo ~60 líneas)
- 🔧 `components/grid/ScheduleGrid.tsx` (262 → ~120 líneas, 54% reducción)
- 🔧 `hooks/use-horizontal-scroll.ts` (277 → ~150 líneas, 46% reducción)
- 🗑️ 3 archivos eliminados (~164 líneas)

**Impacto esperado**:

- 70% reducción en re-renders
- ~200 líneas netas eliminadas
- Single Source of Truth para columnas
- Sin sincronización manual

**Tiempo estimado**: 2.5-3 horas

---

### **FASE 3: Store de UI Global (Modals + Dropdowns)** 🎨

**Objetivo**: Gestión centralizada de overlays

**Issues que resuelve**: CRÍTICO #5, #6

**Estado**: ⏳ **PENDIENTE** (después de FASE 2-ALT)

#### 📋 TODO LIST - FASE 3

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/ui-store.test.ts`
  - [ ] Tests para useEventModal hook actual
  - [ ] Tests para useStageNavigator hook actual
  - [ ] Tests para estado de Sidebar (localStorage)
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-modal-control.test.ts`
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-ui-state.test.ts`
  - [ ] Ejecutar tests - deben pasar con implementación actual

- [ ] **Implementación Store**
  - [ ] Crear `stores/ui-store.ts`
    - [ ] Estado: `openModalId`, `isStageNavigatorOpen`, `isSidebarExpanded`
    - [ ] Acciones: `openModal(id)`, `closeModal()`, `toggleStageNavigator()`, `toggleSidebar()`
    - [ ] Integrar localStorage para sidebar
  - [ ] Crear `hooks/use-ui-state.ts` (wrapper genérico)

- [ ] **Modal Management**
  - [ ] Crear `hooks/use-modal-control.ts`
    - [ ] `useModalControl(eventId)` retorna `{ isOpen, open, close }`
    - [ ] Solo se suscribe a su modal específico
    - [ ] Comparar performance vs estado individual

- [ ] **Refactoring EventItem**
  - [ ] Eliminar `useEventModal()` import
  - [ ] Usar `useModalControl(id)` del store
  - [ ] Verificar que modal abre/cierra correctamente
  - [ ] Mantener mismo comportamiento visual

- [ ] **Refactoring EventModal**
  - [ ] Agregar prop `eventId` para identificación
  - [ ] Solo renderizar si está abierto (`isOpen`)
  - [ ] Mantener misma funcionalidad (ESC, overlay click, etc.)

- [ ] **Refactoring Sidebar**
  - [ ] Eliminar estado local `isExpanded`
  - [ ] Eliminar `useEffect` de localStorage sync
  - [ ] Usar `useUIState()` del store
  - [ ] Verificar que expansión funciona igual

- [ ] **Refactoring StageNavigator**
  - [ ] Eliminar `useStageNavigator()` import
  - [ ] Usar `useUIState()` del store
  - [ ] Verificar que dropdown funciona igual
  - [ ] Mantener click outside behavior

- [ ] **Limpieza**
  - [ ] Eliminar `hooks/use-event-modal.ts`
  - [ ] Eliminar `hooks/use-stage-navigator.ts`
  - [ ] Verificar que no hay imports rotos

- [ ] **Testing Post-Fase**
  - [ ] Todos los tests de UI state deben pasar
  - [ ] Test que solo 1 modal renderiza a la vez
  - [ ] Test localStorage de sidebar persiste
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: modales funcionan idéntico
  - [ ] Testing manual: stage navigator funciona
  - [ ] Testing manual: sidebar expansion funciona

**Archivos afectados**:

- ✨ `stores/ui-store.ts` (nuevo)
- ✨ `hooks/use-modal-control.ts` (nuevo)
- ✨ `hooks/use-ui-state.ts` (nuevo)
- 🔧 `components/event/EventItem.tsx` (refactor)
- 🔧 `components/event/EventModal.tsx` (refactor)
- 🔧 `components/sidebar/index.tsx` (refactor)
- 🔧 `components/sidebar/StageNavigator.tsx` (refactor)
- 🗑️ `hooks/use-event-modal.ts` (eliminar)
- 🗑️ `hooks/use-stage-navigator.ts` (eliminar)

**Impacto esperado**: 60% reducción en memoria, 30% mejora en renders de EventItem

**Tiempo estimado**: 2 horas

---

### **FASE 4: Optimización con React.memo** ⚡

**Objetivo**: Memoizar componentes que no deben re-renderizar

**Issues que resuelve**: CRÍTICO #8

**Estado**: ⏳ **PENDIENTE** (después de FASE 3)

#### 📋 TODO LIST - FASE 4

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/utils/memo-comparators.test.ts`
  - [ ] Tests de render behavior actual (crear helper para contar renders)
  - [ ] Benchmark actual de re-renders en cambios de estado
  - [ ] Ejecutar tests - deben pasar

- [ ] **Comparadores Custom**
  - [ ] Crear `utils/memo-comparators.ts`
    - [ ] `areEventItemPropsEqual` - comparador para EventItem
    - [ ] `areStagePropsEqual` - comparador para stage-related props
    - [ ] `areTimePropsEqual` - comparador para time-related props
  - [ ] Testear comparadores con casos edge

- [ ] **Memoización de Componentes Presentacionales**
  - [ ] `EventItem`: `React.memo` con `areEventItemPropsEqual`
  - [ ] `EventGroup`: `React.memo` básico
  - [ ] `GridColumn`: `React.memo` con comparador custom
  - [ ] `GridTimeSlots`: `React.memo` básico
  - [ ] `DaySelector`: `React.memo` básico
  - [ ] `NavigationButtons`: `React.memo` básico
  - [ ] `StageNavigator`: `React.memo` con comparador custom
  - [ ] `FloatingButton`: `React.memo` básico
  - [ ] `CollapseButton`: `React.memo` básico

- [ ] **Verificación de Props Estables**
  - [ ] Verificar que hooks de stores devuelven refs estables
  - [ ] Verificar que callbacks están memoizados
  - [ ] Agregar `useCallback` donde sea necesario

- [ ] **Testing Post-Fase**
  - [ ] Tests de comparadores deben pasar
  - [ ] Benchmark de re-renders: debe mostrar mejora significativa
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: UI debe sentirse más fluida
  - [ ] React DevTools: verificar menos re-renders

**Archivos afectados**:

- ✨ `utils/memo-comparators.ts` (nuevo)
- 🔧 `components/event/EventItem.tsx` (agregar memo)
- 🔧 `components/event/EventGroup.tsx` (agregar memo)
- 🔧 `components/grid/GridColumn.tsx` (agregar memo)
- 🔧 `components/grid/GridTimeSlots.tsx` (agregar memo)
- 🔧 `components/sidebar/DaySelector.tsx` (agregar memo)
- 🔧 `components/sidebar/NavigationButtons.tsx` (agregar memo)
- 🔧 `components/sidebar/StageNavigator.tsx` (agregar memo)
- 🔧 `components/general/FloatingButton.tsx` (agregar memo)
- 🔧 `components/sidebar/CollapseButton.tsx` (agregar memo)

**Impacto esperado**: 50-70% reducción en renders de componentes hijos

**Tiempo estimado**: 1 hora

---

### **FASE 5: Limpieza y Documentación** 🧹

**Objetivo**: Eliminar código legacy y documentar

**Estado**: ⏳ **PENDIENTE** (después de FASE 4)

#### 📋 TODO LIST - FASE 5

- [ ] **Testing Pre-Fase**
  - [ ] Verificar que no existen imports a archivos que fueron eliminados
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar

- [ ] **Constantes Centralizadas**
  - [ ] Crear `constants.ts`
    - [ ] `COLUMN_WIDTH = 320`
    - [ ] `GAP_WIDTH = 16`
    - [ ] `VISIBLE_COLUMNS = 1`
    - [ ] Todas las constantes del módulo UI
  - [ ] Actualizar imports en componentes

- [ ] **Documentación**
  - [ ] Crear `stores/README.md`
    - [ ] Arquitectura de stores
    - [ ] Cuándo usar cada store
    - [ ] Ejemplos de uso
    - [ ] Diagrama de flujo de datos
  - [ ] Crear `hooks/README.md`
    - [ ] Guía de hooks
    - [ ] Cuándo crear nuevos hooks
    - [ ] Patterns recomendados
    - [ ] Ejemplos de uso común

- [ ] **Tipos Estrictos**
  - [ ] Revisar todos los stores tengan types explícitos
  - [ ] Eliminar `any` types si existen
  - [ ] Agregar JSDoc comments a funciones públicas

- [ ] **Testing Final**
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Test de integración completa
  - [ ] Verificar bundle size (debe ser menor o igual)
  - [ ] Testing manual: funcionalidad completa idéntica

**Archivos afectados**:

- ✨ `stores/README.md` (nuevo)
- ✨ `hooks/README.md` (nuevo)
- ✨ `constants.ts` (nuevo)
- 🔧 Múltiples archivos (actualizar imports de constantes)

**Impacto esperado**: Código más mantenible, documentado y profesional

**Tiempo estimado**: 1 hora

---

## 📊 RESUMEN FINAL

### **Estructura Final de Archivos**

```
src/features/schedule/ui/
├── stores/
│   ├── navigation-store.ts           ✅ COMPLETADO (FASE 1)
│   ├── schedule-columns-store.ts     ✨ NUEVO (FASE 2-ALT - reemplaza 3 stores)
│   ├── ui-store.ts                   ✨ NUEVO (FASE 3)
│   ├── types.ts                      ✅ COMPLETADO (FASE 0)
│   └── README.md                     ✨ NUEVO (FASE 5)
├── hooks/
│   ├── use-navigation.ts             ✅ COMPLETADO (FASE 1)
│   ├── use-schedule-columns.ts       ✨ NUEVO (FASE 2-ALT)
│   ├── use-modal-control.ts          ✨ NUEVO (FASE 3)
│   ├── use-ui-state.ts               ✨ NUEVO (FASE 3)
│   ├── use-horizontal-scroll.ts      🔧 REFACTORED (FASE 2-ALT - 46% reducido)
│   ├── use-container-visibility.ts   ✅ MANTENER
│   └── README.md                     ✨ NUEVO (FASE 5)
├── utils/
│   └── memo-comparators.ts           ✨ NUEVO (FASE 4)
├── constants.ts                      ✨ NUEVO (FASE 5)
├── components/                       🔧 REFACTORED (FASES 2-ALT, 3, 4)
├── adapters/                         ✅ MANTENER
└── types/                            ✅ MANTENER

ELIMINADOS:
❌ hooks/use-day-selection.ts (FASE 1)
❌ stores/stage-selection-store.ts (FASE 2-ALT)
❌ hooks/use-stage-selection.ts (FASE 2-ALT)
❌ hooks/use-stage-actions.ts (FASE 2-ALT)
❌ hooks/use-event-modal.ts (FASE 3)
❌ hooks/use-stage-navigator.ts (FASE 3)
```

### **Métricas de Impacto Esperadas**

| Métrica                         | Antes     | Después            | Mejora     |
| ------------------------------- | --------- | ------------------ | ---------- |
| Re-renders en cambio de stage   | ~15-20    | ~3-5               | **70-75%** |
| Re-renders en navegación        | ~10-12    | ~2-3               | **80%**    |
| Re-renders en abrir modal       | ~50+      | 1                  | **98%**    |
| Memoria (estados duplicados)    | N × items | Centralizados      | **60%**    |
| Líneas en ScheduleGrid          | 262       | ~120               | **54%**    |
| Líneas en use-horizontal-scroll | 277       | ~150               | **46%**    |
| Stores separados para columnas  | 2         | 1                  | **50%**    |
| Bundle size                     | Actual    | Similar o reducido | **0-5%**   |

### **Tiempo Total Estimado**: 7-8 horas (reducido de 10-12)

### **Orden de Ejecución**:

```
FASE 0 → FASE 1 → FASE 2-ALT → FASE 3 → FASE 4 → FASE 5
  ⚙️      🗂️       🎯          🎨       ⚡       🧹
  ✅      ✅       ⏳          ⏳       ⏳       ⏳
```

---

## ✅ CRITERIOS DE ÉXITO POR FASE

Después de **CADA** fase:

1. ✅ `pnpm build` pasa sin errores
2. ✅ `pnpm test` pasa todos los tests
3. ✅ Funcionalidad visual idéntica (no cambios de UX)
4. ✅ No errores en consola del browser
5. ✅ Tests específicos de la fase pasan
6. ✅ Mejora medible en performance (React DevTools Profiler)

---

## 🚨 REGLAS DE EMERGENCIA

Si una fase falla:

1. **STOP** - No continuar a la siguiente fase
2. **REVERT** - Hacer rollback del commit de la fase
3. **DEBUG** - Identificar el issue específico
4. **FIX** - Corregir antes de continuar
5. **TEST** - Re-ejecutar todos los criterios de éxito

**El plan es progresivo - cada fase debe ser 100% exitosa antes de continuar.**

---

## 🎯 PRÓXIMOS PASOS

**Estado actual**: FASE 1 completada ✅

**Siguiente**: FASE 2-ALT - Column Management Store (Arquitectura Unificada)

**Recomendación**: Solicitar aprobación del usuario antes de comenzar FASE 2-ALT.

---

## 📝 NOTAS SOBRE CAMBIOS AL PLAN

### **Cambios Arquitectónicos vs Plan Original**

Este plan ha sido reestructurado basándose en feedback arquitectónico para consolidar responsabilidades:

**Plan Original**:

- FASE 2: Store de Selección de Stages (solo filtrado)
- FASE 3: Store de Scroll/Drag (solo navegación)
- FASE 6: Selectores Derivados (cálculos separados)
- FASE 7: Sincronización (coordinación manual)

**Plan Actualizado**:

- **FASE 2-ALT**: Column Management Store (TODO unificado)
  - Consolida filtrado + navegación + sincronización + derived state
  - Elimina necesidad de coordinación manual
  - Single Source of Truth para columnas

**Ventajas del cambio**:

1. ✅ Menos stores = menos complejidad
2. ✅ Sin sincronización manual = menos bugs
3. ✅ Derived state automático = siempre consistente
4. ✅ Una fuente de verdad = más fácil de razonar
5. ✅ Menos código total = más mantenible
6. ✅ Testeable en aislamiento = mayor calidad

**Trade-offs**:

- ⚠️ FASE 2-ALT es más grande (pero reemplaza 4 fases originales)
- ⚠️ Requiere más planificación inicial (pero menos iteraciones)

**Resultado**: Mejor arquitectura, menos tiempo total, código más limpio.
