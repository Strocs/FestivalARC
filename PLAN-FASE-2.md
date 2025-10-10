### **FASE 2-ALT: Column Management Store - Arquitectura Unificada** 🎯

**Objetivo**: Centralizar TODA la lógica relacionada con columnas en un único store

**Issues que resuelve**: CRÍTICO #1, #2, #3, #4A, #4B, #7 (consolida múltiples issues críticos)

**Diseño**: Single Source of Truth para filtrado, navegación y auto-ajuste de columnas

**Estado**: ⏳ **PENDIENTE**

#### 🎨 **ARQUITECTURA**

**Problema Identificado**:

El diseño actual tiene estado fragmentado en 4 lugares diferentes manejando aspectos de LAS MISMAS columnas:

1. `stage-selection-store.ts` - Selección de stages (qué mostrar)
2. `use-horizontal-scroll.ts` - Navegación horizontal (dónde estamos)
3. `ScheduleGrid.tsx` líneas 46-50 - Filtrado manual con `useMemo`
4. `ScheduleGrid.tsx` líneas 78-164 - Sincronización compleja (86 líneas de useEffect!)

**Problemas resultantes**:

- Sincronización manual entre filtrado ↔ navegación
- Lógica duplicada y acoplamiento
- Difícil de testear (lógica en múltiples lugares)
- Re-renders innecesarios
- Código difícil de mantener

**Solución Propuesta**:

UN SOLO store (`schedule-columns-store`) maneja:

- ✅ Datos completos de columnas (referencia inmutable)
- ✅ IDs de stages disponibles y seleccionados
- ✅ Filtrado automático (derived state: `filteredColumns`)
- ✅ Posición actual en lista filtrada (`currentIndex`)
- ✅ Auto-ajuste inteligente de posición al cambiar filtrado
- ✅ Navegación (next/prev/selectStage)
- ✅ Integración con localStorage
- ✅ Estados derivados: `isAllSelected`, `canGoNext`, `canGoPrev`, etc.

#### 🔄 **FLUJO DE DATOS SIMPLIFICADO**

```
┌─────────────────┐
│ ScheduleGrid    │
│ (recibe columns)│
└────────┬────────┘
         │
         ├─► useScheduleColumns(columns) ◄─── Hook único
         │
         └──┐
            ▼
    ┌──────────────────────────────┐
    │  schedule-columns-store.ts   │
    │                              │
    │  • initialize(columns)       │
    │  • Lee localStorage          │
    │  • Calcula filteredColumns   │ ◄─── Automático (derived)
    │  • Maneja currentIndex       │
    │  • Auto-ajusta posición      │
    └───────────┬──────────────────┘
                │
                ├─► filteredColumns ──────► GridColumns (renderizar)
                ├─► selectedStageIds ─────► StageSelection (checkboxes)
                ├─► currentIndex ─────────► NavigationButtons (estado)
                ├─► toggleStage() ────────► StageSelection (acciones)
                └─► selectStage() ────────► StageNavigator (navegar)
```

**NO MÁS**:

- ❌ Prop drilling de estado de selección
- ❌ Filtrado manual con `useMemo`
- ❌ Sincronización con `useEffect` complejo
- ❌ Múltiples hooks coordinados manualmente
- ❌ Referencias manuales para tracking

#### 📋 TODO LIST - FASE 2-ALT

- [ ] **Testing Pre-Fase**
  - [ ] Limpiar tests de la antigua FASE 2
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/schedule-columns-store.test.ts`
    - [ ] Test: Inicialización con localStorage vacío (todos seleccionados)
    - [ ] Test: Inicialización con localStorage existente (IDs válidos)
    - [ ] Test: Inicialización con localStorage inválido (IDs filtrados)
    - [ ] Test: `toggleStage` actualiza `selectedStageIds` y `filteredColumns`
    - [ ] Test: `toggleStage` ajusta `currentIndex` si se remueve stage visible
    - [ ] Test: `selectAll` resetea posición a 0
    - [ ] Test: `deselectAll` resetea posición a 0
    - [ ] Test: `toggleAll` alterna entre todos/ninguno
    - [ ] Test: `selectStage` navega a stage específico en lista filtrada
    - [ ] Test: `goToNext`/`goToPrev` respetan límites
    - [ ] Test: `goToIndex` clampea índice a rango válido
    - [ ] Test: Derived states (`isAllSelected`, `canGoNext`, etc.) correctos
    - [ ] Test: Auto-ajuste cuando se añade stage antes del actual
    - [ ] Test: Auto-ajuste cuando se remueve stage antes del actual
    - [ ] Test: Mantener stage actual visible tras filtrado si es posible
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-schedule-columns.test.ts`
    - [ ] Test: Hook inicializa store en mount
    - [ ] Test: Hook expone todas las props correctamente
    - [ ] Test: Cambios en store actualizan hook
  - [ ] Ejecutar tests - deben definir comportamiento esperado

- [ ] **Implementación Store Unificado**
  - [ ] Crear `stores/schedule-columns-store.ts`
    - [ ] **Estado Base**:
      - [ ] `allColumns: UIColumn[]` - Referencia completa (inmutable)
      - [ ] `availableStageIds: string[]` - IDs de todos los stages
      - [ ] `selectedStageIds: string[]` - IDs seleccionados para filtrado
      - [ ] `currentIndex: number` - Posición en lista FILTRADA
    - [ ] **Derived State** (auto-calculado):
      - [ ] `filteredColumns: UIColumn[]` - Columnas visibles
      - [ ] `isAllSelected: boolean`
      - [ ] `isNoneSelected: boolean`
      - [ ] `selectedCount: number`
      - [ ] `canGoNext: boolean`
      - [ ] `canGoPrev: boolean`
      - [ ] `currentStage: UIHeaderItem | null`
    - [ ] **Helper Functions**:
      - [ ] `computeDerivedState()` - Calcula todos los derived states
      - [ ] `adjustIndexAfterFilter()` - Ajusta posición inteligentemente
        - [ ] Mantener stage actual si sigue visible
        - [ ] Ajustar a límite si fuera de rango
        - [ ] Retornar 0 si no hay columnas
    - [ ] **Acciones - Inicialización**:
      - [ ] `initialize(columns)` - Setup inicial con localStorage
        - [ ] Guard: `hasInitialized` previene múltiples init
        - [ ] Lee localStorage con `trackSelectionStorage.get()`
        - [ ] Valida IDs con `getValidTrackIds()`
        - [ ] Default: todos seleccionados si localStorage vacío
        - [ ] Guarda en localStorage
        - [ ] Calcula derived state inicial
    - [ ] **Acciones - Filtrado**:
      - [ ] `toggleStage(id)` - Toggle individual + auto-ajuste
      - [ ] `selectAll()` - Selecciona todos + reset posición
      - [ ] `deselectAll()` - Deselecciona todos + reset posición
      - [ ] `toggleAll()` - Alterna basado en `isAllSelected`
    - [ ] **Acciones - Navegación**:
      - [ ] `selectStage(stageId)` - Navega a stage por ID
      - [ ] `goToNext()` - Siguiente (respeta `canGoNext`)
      - [ ] `goToPrev()` - Anterior (respeta `canGoPrev`)
      - [ ] `goToIndex(index)` - Navega a índice (clamped)
      - [ ] `resetPosition()` - Vuelve a índice 0
    - [ ] **Integración localStorage**:
      - [ ] Guardar en cada cambio de `selectedStageIds`
      - [ ] Usar `trackSelectionStorage.set()`
    - [ ] **Export para Tests**:
      - [ ] `resetScheduleColumnsStore()` - Limpia estado y guard
  - [ ] Crear `hooks/use-schedule-columns.ts` (wrapper del store)
    - [ ] Inicializar store en mount con `useEffect`
    - [ ] Selectores agrupados por categoría:
      - [ ] **Data**: `filteredColumns`, `allColumns`
      - [ ] **Selection**: `selectedStageIds`, `isAllSelected`, `isNoneSelected`, `selectedCount`
      - [ ] **Navigation**: `currentIndex`, `canGoNext`, `canGoPrev`, `currentStage`
      - [ ] **Actions - Filtering**: `toggleStage`, `selectAll`, `deselectAll`, `toggleAll`
      - [ ] **Actions - Navigation**: `selectStage`, `goToNext`, `goToPrev`, `goToIndex`, `resetPosition`
    - [ ] Retornar objeto con API completa

- [ ] **Refactoring ScheduleGrid** (SIMPLIFICACIÓN MASIVA)
  - [ ] **ELIMINAR** (líneas que desaparecen):
    - [ ] Línea 16: Import de `useStageSelection`
    - [ ] Línea 44: Llamada a `useStageSelection(stages.map(s => s.id))`
    - [ ] Líneas 46-50: Cálculo manual de `filteredRows` con `useMemo`
    - [ ] Líneas 78-84: `previousSelectionRef` y `currentColumnRef` refs
    - [ ] Líneas 85-164: **TODO el `useEffect` de sincronización (80 líneas!)**
  - [ ] **REEMPLAZAR CON**:
    - [ ] Importar `useScheduleColumns`
    - [ ] Llamar una vez: `const { filteredColumns, selectedStageIds, currentIndex, canGoNext, canGoPrev, ... } = useScheduleColumns(columns)`
    - [ ] Usar `filteredColumns` directamente (en lugar de `filteredRows`)
    - [ ] Pasar props del hook a componentes hijos
  - [ ] **Adaptar use-horizontal-drag**:
    - [ ] Cambiar de manejar `currentColumnIndex` a recibir `currentIndex` del store
    - [ ] Recibir callbacks `onNext`/`onPrev` que llaman al store
    - [ ] Mantener solo: drag físico, rubber band, snap to column, event listeners
  - [ ] **RESULTADO**: De 262 líneas a ~120 líneas (~54% reducción)

- [ ] **Refactoring use-horizontal-scroll.ts**
  - [ ] Eliminar estado interno: `currentColumnIndex`, `setCurrentColumnIndex`
  - [ ] Props: Agregar `currentIndex: number`, `onNext: () => void`, `onPrev: () => void`
  - [ ] Usar `currentIndex` prop en lugar de estado interno
  - [ ] Callbacks llaman props en lugar de actualizar estado
  - [ ] Mantener toda la lógica de drag/scroll físico
  - [ ] **RESULTADO**: De 277 líneas a ~150 líneas (~46% reducción)

- [ ] **Refactoring StageSelection**
  - [ ] **Decisión de diseño**: Elegir entre:
    - [ ] **OPCIÓN A** (Props drilling - más explícito):
      - [ ] Recibir `selectedStageIds`, `onToggleStage`, `onSelectAll`, `onDeselectAll` como props
      - [ ] ScheduleGrid obtiene del hook y pasa down
      - [ ] ✅ Ventaja: Componente más reusable, props explícitas
    - [ ] **OPCIÓN B** (Store directo - más simple):
      - [ ] Usar selectores: `useScheduleColumnsStore(state => state.selectedStageIds)`
      - [ ] Usar acciones: `useScheduleColumnsStore(state => state.toggleStage)`
      - [ ] ✅ Ventaja: Menos prop drilling, código más simple
  - [ ] Mantener sorting local de stages: `const sortedStages = [...stages].sort(...)`
  - [ ] Verificar checkboxes reflejan estado correcto
  - [ ] Verificar botones "Todos/Ninguno" funcionan

- [ ] **Refactoring Sidebar**
  - [ ] Simplificar props según opción elegida:
    - [ ] Si OPCIÓN A: Pasar props de selección a StageSelection
    - [ ] Si OPCIÓN B: Solo pasar `stages` (data)
  - [ ] Eliminar props obsoletas de selección si existían

- [ ] **Refactoring NavigationButtons**
  - [ ] Props: Recibir `onNext`, `onPrev`, `canGoNext`, `canGoPrev`
  - [ ] ScheduleGrid los obtiene del hook
  - [ ] Sin cambios en la API del componente (ya usa props)

- [ ] **Refactoring StageNavigator**
  - [ ] Props: Recibir `stages` de `filteredColumns.map(r => r.header)`
  - [ ] Props: Recibir `currentStageIndex` del hook
  - [ ] Props: Recibir `onStageClick` que llama `selectStage(stageId)`
  - [ ] Simplificar lógica de navegación (ya no busca en array, solo llama callback)

- [ ] **Limpieza**
  - [ ] 🗑️ Eliminar `stores/stage-selection-store.ts` (viejo - reemplazado)
  - [ ] 🗑️ Eliminar `hooks/use-stage-selection.ts` (viejo - reemplazado)
  - [ ] 🗑️ Eliminar `hooks/use-stage-actions.ts` (viejo - reemplazado)
  - [ ] 🔒 Mantener `storage/track-selection-storage.ts` (usado por nuevo store)
  - [ ] Verificar que no hay imports rotos con grep/IDE
  - [ ] Actualizar imports en todos los archivos afectados

- [ ] **Testing Post-Fase**
  - [ ] Todos los tests del nuevo store pasan (100% coverage esperado)
  - [ ] Todos los tests del hook pasan
  - [ ] Test: Inicialización con localStorage funciona
  - [ ] Test: Filtrado actualiza `filteredColumns` automáticamente
  - [ ] Test: Navegación opera sobre lista filtrada
  - [ ] Test: Auto-ajuste de posición al remover stage visible
  - [ ] Test: Auto-ajuste de posición al agregar stage antes del actual
  - [ ] Test: selectAll/deselectAll resetea posición
  - [ ] Test: localStorage persiste entre reloads
  - [ ] Ejecutar `pnpm build` - debe pasar (0 errors, 0 warnings)
  - [ ] Ejecutar `pnpm test` - debe pasar (todos los tests)
  - [ ] Testing manual en browser:
    - [ ] Filtrado funciona: checkboxes muestran/ocultan columnas
    - [ ] Navegación funciona: botones next/prev avanzan correctamente
    - [ ] Auto-navegación: agregar stage navega si es anterior al actual
    - [ ] Auto-navegación: remover stage ajusta posición
    - [ ] "Todos/Ninguno" funcionan y resetean posición
    - [ ] StageNavigator navega a stage correcto
    - [ ] localStorage persiste selección en refresh
    - [ ] No errores en consola
  - [ ] React DevTools Profiler: Verificar re-renders reducidos

**Archivos afectados**:

- ✨ `stores/schedule-columns-store.ts` (nuevo - ~250 líneas)
- ✨ `hooks/use-schedule-columns.ts` (nuevo - ~60 líneas)
- ✨ `__tests__/stores/schedule-columns-store.test.ts` (nuevo - tests completos)
- ✨ `__tests__/hooks/use-schedule-columns.test.ts` (nuevo)
- 🔧 `components/grid/ScheduleGrid.tsx` (simplificación: 262 → ~120 líneas, ~54% reducción)
- 🔧 `hooks/use-horizontal-scroll.ts` (simplificación: 277 → ~150 líneas, ~46% reducción)
- 🔧 `components/sidebar/index.tsx` (simplificar props)
- 🔧 `components/sidebar/StageSelection.tsx` (usar store/props según opción)
- 🔧 `components/sidebar/NavigationButtons.tsx` (recibir nuevas props)
- 🔧 `components/sidebar/StageNavigator.tsx` (usar selectStage)
- 🗑️ `stores/stage-selection-store.ts` (eliminar - ~120 líneas)
- 🗑️ `hooks/use-stage-selection.ts` (eliminar - ~29 líneas)
- 🗑️ `hooks/use-stage-actions.ts` (eliminar - ~15 líneas)
- 🔒 `storage/track-selection-storage.ts` (mantener - usado por nuevo store)

**Impacto esperado**:

- **Re-renders**: 70% reducción en re-renders de grid y sidebar
- **Código eliminado**: ~200 líneas netas (140 de ScheduleGrid + 60 de otros)
- **Código nuevo**: ~310 líneas (250 store + 60 hook)
- **Balance**: Código más simple, centralizado y testeable
- **Lógica**: Centralizada en store, fácil de mantener
- **Sincronización**: Automática vía derived state
- **Performance**: Cálculos solo cuando cambia data relevante
- **Testeable**: Lógica aislada en store puro

**Tiempo estimado**: 2.5-3 horas (consolida FASE 2, 3 y 7 originales)

---

#### 🎯 **VENTAJAS DEL DISEÑO UNIFICADO**

1. **Single Source of Truth**: Un store maneja TODO relacionado con columnas
2. **Derived State Automático**: `filteredColumns` siempre sincronizado con `selectedStageIds`
3. **Navegación Inteligente**: Auto-ajuste de posición integrado en el store
4. **Menos Código**: ~200 líneas eliminadas total
5. **Más Testeable**: Lógica compleja aislada en store, fácil de probar unitariamente
6. **Sin Sincronización Manual**: No más `useEffect` complejos coordinando estados
7. **Mejor Performance**: Cálculos solo cuando cambia data relevante (Zustand optimiza)
8. **Mantenibilidad**: Cambios futuros en un solo lugar

#### 📊 **COMPARACIÓN ARQUITECTÓNICA**

| Aspecto                             | Diseño Anterior (Fragmentado)                         | Diseño Unificado (Propuesto)  |
| ----------------------------------- | ----------------------------------------------------- | ----------------------------- |
| Stores involucrados                 | 2 (stage-selection + scroll)                          | 1 (schedule-columns)          |
| Hooks coordinados                   | 3 (useStageSelection + useHorizontalDrag + useEffect) | 1 (useScheduleColumns)        |
| Filtrado                            | Manual en componente (`useMemo`)                      | Automático en store (derived) |
| Navegación                          | Estado separado en hook                               | Estado integrado en store     |
| Auto-ajuste posición                | useEffect 86 líneas en componente                     | Helper function en store      |
| Sincronización filtrado↔navegación | Manual con refs + useEffect                           | Automática (derived state)    |
| Líneas en ScheduleGrid              | 262                                                   | ~120 (~54% reducción)         |
| Líneas en use-horizontal-scroll     | 277                                                   | ~150 (~46% reducción)         |
| Testeable                           | Difícil (lógica en múltiples lugares)                 | Fácil (store aislado)         |
| Mantenibilidad                      | Compleja (cambios en 4 lugares)                       | Simple (cambios en 1 lugar)   |
