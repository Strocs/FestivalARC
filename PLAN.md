# 📋 PLAN DE REFACTORIZACIÓN UI SCHEDULE - ZUSTAND OPTIMIZATION

## 🎯 OBJETIVO GENERAL

Optimizar el módulo `src/features/schedule/ui/` reemplazando estado local fragmentado por stores centralizados con Zustand, eliminando re-renders innecesarios y mejorando el performance general sin afectar la usabilidad.

## 📐 REGLAS GENERALES

### 🔒 **REGLA DE TESTING OBLIGATORIA**

**Antes de cada fase, SIEMPRE crear los archivos de test correspondientes:**

1. ✅ **Pre-Fase**: Crear tests que validen el comportamiento actual
2. ✅ **Durante Refactor**: Los tests deben pasar con implementación actual Y nueva
3. ✅ **Post-Fase**: Todos los tests deben pasar sin modificaciones
4. ✅ **Cobertura**: Cada store, hook y función debe tener su test correspondiente

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

### **FASE 0: Setup Inicial** ⚙️

**Objetivo**: Instalar Zustand y crear estructura base

**Issues que resuelve**: Setup de infraestructura

#### 📋 TODO LIST - FASE 0

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/setup.test.ts`
  - [ ] Test que valide que todos los componentes renderizan sin errores
  - [ ] Test de integración básica de ScheduleGrid
  - [ ] Ejecutar `pnpm test` - debe pasar

- [ ] **Instalación**
  - [ ] Ejecutar `pnpm add zustand`
  - [ ] Verificar que se agregó a package.json

- [ ] **Estructura Base**
  - [ ] Crear directorio `src/features/schedule/ui/stores/`
  - [ ] Crear `src/features/schedule/ui/stores/types.ts`
  - [ ] Definir interfaces base para stores

- [ ] **Testing Post-Fase**
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Verificar que no hay errores en consola

**Archivos creados**:

- ✨ `stores/types.ts`
- ✨ `__tests__/setup.test.ts`

**Tiempo estimado**: 30 minutos

---

### **FASE 1: Store de Navegación (Day + Column)** 🗂️

**Objetivo**: Centralizar navegación de días y columnas

**Issues que resuelve**: CRÍTICO #1 (lógica compleja en useEffect de ScheduleGrid)

#### 📋 TODO LIST - FASE 1

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/navigation-store.test.ts`
  - [ ] Tests para useDaySelection hook actual
  - [ ] Tests para lógica de navegación en ScheduleGrid
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-navigation.test.ts`
  - [ ] Ejecutar tests - deben pasar con implementación actual

- [ ] **Implementación Store**
  - [ ] Crear `stores/navigation-store.ts`
    - [ ] Estado: `currentDayIndex`, `currentColumnIndex`, `totalDays`, `totalColumns`
    - [ ] Acciones: `setDay`, `nextDay`, `prevDay`, `goToColumn`, `resetColumn`
    - [ ] Derivados: `canGoNextDay`, `canGoPrevDay`, `canGoNextColumn`, `canGoPrevColumn`
  - [ ] Crear `hooks/use-navigation.ts` (wrapper tipado)

- [ ] **Refactoring ScheduleGrid**
  - [ ] Eliminar `useDaySelection()` import
  - [ ] Eliminar `useEffect` complejo (líneas 81-164)
  - [ ] Reemplazar con `useNavigation()` del store
  - [ ] Mantener misma funcionalidad

- [ ] **Refactoring DaySelector**
  - [ ] Eliminar props `currentDayIndex`, `onDayChange`
  - [ ] Usar `useNavigation()` directamente
  - [ ] Verificar que navegación funciona igual

- [ ] **Refactoring NavigationButtons**
  - [ ] Eliminar props `canGoNext`, `canGoPrev`, `onNext`, `onPrev`
  - [ ] Usar `useNavigation()` directamente
  - [ ] Mantener disabled states correctos

- [ ] **Limpieza**
  - [ ] Eliminar `hooks/use-day-selection.ts`
  - [ ] Verificar que no hay imports rotos

- [ ] **Testing Post-Fase**
  - [ ] Todos los tests de navegación deben pasar
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: navegación de días funciona idéntica

**Archivos afectados**:

- ✨ `stores/navigation-store.ts` (nuevo)
- ✨ `hooks/use-navigation.ts` (nuevo)
- 🔧 `components/grid/ScheduleGrid.tsx` (refactor)
- 🔧 `components/sidebar/DaySelector.tsx` (refactor)
- 🔧 `components/sidebar/NavigationButtons.tsx` (refactor)
- 🗑️ `hooks/use-day-selection.ts` (eliminar)

**Impacto esperado**: 30-40% mejora en renders de navegación

**Tiempo estimado**: 1.5 horas

---

### **FASE 2: Store de Selección de Stages** 🎭

**Objetivo**: Centralizar selección con localStorage integrado

**Issues que resuelve**: CRÍTICO #2, #3, #4A, #7

#### 📋 TODO LIST - FASE 2

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/stage-selection-store.test.ts`
  - [ ] Tests para useStageSelection hook actual
  - [ ] Tests para handlers de StageSelection component
  - [ ] Tests para integración localStorage
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-stage-selection.test.ts`
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-stage-actions.test.ts`
  - [ ] Ejecutar tests - deben pasar con implementación actual

- [ ] **Implementación Store**
  - [ ] Crear `stores/stage-selection-store.ts`
    - [ ] Estado: `selectedStageIds`, `availableStageIds`
    - [ ] Acciones: `toggleStage`, `selectAll`, `deselectAll`, `toggleAll`, `setStages`
    - [ ] Derivados: `isAllSelected`, `isNoneSelected`, `selectedCount`
    - [ ] Integrar localStorage directamente
  - [ ] Crear `hooks/use-stage-selection.ts` (wrapper store)
  - [ ] Crear `hooks/use-stage-actions.ts` (acciones separadas)

- [ ] **Refactoring ScheduleGrid**
  - [ ] Eliminar `useStageSelection()` hook import
  - [ ] Usar `useStageSelection()` del store para leer
  - [ ] Eliminar props de stage selection al Sidebar
  - [ ] Mantener `filteredRows` calculation pero con nueva fuente

- [ ] **Refactoring Sidebar**
  - [ ] Eliminar props `selectedStageIds`, `onStageSelectionChange`
  - [ ] Pasar solo `stages` (data)
  - [ ] Verificar que StageSelection sigue funcionando

- [ ] **Refactoring StageSelection**
  - [ ] Eliminar todos los handlers internos (líneas 17-39)
  - [ ] Usar `useStageActions()` del store
  - [ ] Usar `useStageSelection()` para estado
  - [ ] Mantener sorting local: `sortedStages`
  - [ ] Verificar checkboxes y botones funcionan igual

- [ ] **Limpieza**
  - [ ] Eliminar `hooks/use-stage-selection.ts` (old)
  - [ ] Mantener `storage/track-selection-storage.ts` (usado por store)
  - [ ] Verificar que no hay imports rotos

- [ ] **Testing Post-Fase**
  - [ ] Todos los tests de selección deben pasar
  - [ ] Test localStorage: selección persiste en reload
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: selección de stages idéntica

**Archivos afectados**:

- ✨ `stores/stage-selection-store.ts` (nuevo)
- ✨ `hooks/use-stage-selection.ts` (nuevo - wrapper)
- ✨ `hooks/use-stage-actions.ts` (nuevo)
- 🔧 `components/grid/ScheduleGrid.tsx` (refactor)
- 🔧 `components/sidebar/index.tsx` (refactor)
- 🔧 `components/sidebar/StageSelection.tsx` (refactor)
- 🗑️ `hooks/use-stage-selection.ts` (eliminar - old)
- 🔒 `storage/track-selection-storage.ts` (mantener)

**Impacto esperado**: 40-50% reducción en re-renders de sidebar y grid

**Tiempo estimado**: 1.5 horas

---

### **FASE 3: Store de Scroll/Drag** 🖱️

**Objetivo**: Separar lógica de drag de eventos DOM

**Issues que resuelve**: CRÍTICO #4B (useHorizontalDrag muy complejo)

#### 📋 TODO LIST - FASE 3

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/scroll-store.test.ts`
  - [ ] Tests para useHorizontalDrag hook actual
  - [ ] Tests para lógica de drag, scroll, rubber band
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-drag-handlers.test.ts`
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-scroll-position.test.ts`
  - [ ] Ejecutar tests - deben pasar con implementación actual

- [ ] **Implementación Store**
  - [ ] Crear `stores/scroll-store.ts`
    - [ ] Estado: `offset`, `isDragging`, `currentColumnIndex`
    - [ ] Acciones: `setOffset`, `setDragging`, `goToColumn`, `goNext`, `goPrev`, `reset`
    - [ ] Derivados: `canGoNext`, `canGoPrev`
  - [ ] Crear `hooks/use-scroll-position.ts` (wrapper store)

- [ ] **Separación de Handlers**
  - [ ] Crear `hooks/use-drag-handlers.ts`
    - [ ] Extraer `handleDragStart`, `handleDragMove`, `handleDragEnd`
    - [ ] Usar scroll store para actualizar estado
    - [ ] Mantener lógica de rubber band resistance
    - [ ] Memoizar handlers correctamente

- [ ] **Refactoring useHorizontalDrag**
  - [ ] Reducir de 277 líneas a ~80 líneas
  - [ ] Solo manejar: refs, event listeners, transformaciones CSS
  - [ ] Leer estado del scroll store
  - [ ] Usar handlers de `use-drag-handlers`
  - [ ] Mantener misma API externa

- [ ] **Refactoring ScheduleGrid**
  - [ ] Usar `useScrollPosition()` para leer estado
  - [ ] Mantener `useHorizontalDrag()` solo para DOM interactions
  - [ ] Verificar que drag & scroll funcionan igual

- [ ] **Testing Post-Fase**
  - [ ] Todos los tests de scroll/drag deben pasar
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: drag horizontal funciona idéntico
  - [ ] Testing manual: navegación con botones funciona
  - [ ] Testing manual: rubber band effect funciona

**Archivos afectados**:

- ✨ `stores/scroll-store.ts` (nuevo)
- ✨ `hooks/use-drag-handlers.ts` (nuevo)
- ✨ `hooks/use-scroll-position.ts` (nuevo)
- 🔧 `hooks/use-horizontal-scroll.ts` (refactor - 70% reducción)
- 🔧 `components/grid/ScheduleGrid.tsx` (refactor)

**Impacto esperado**: 20% mejora en performance de drag, código más testeable

**Tiempo estimado**: 1.5 horas

---

### **FASE 4: Store de UI Global (Modals + Dropdowns)** 🎨

**Objetivo**: Gestión centralizada de overlays

**Issues que resuelve**: CRÍTICO #5, #6

#### 📋 TODO LIST - FASE 4

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

### **FASE 5: Optimización con React.memo** ⚡

**Objetivo**: Memoizar componentes que no deben re-renderizar

**Issues que resuelve**: CRÍTICO #8

#### 📋 TODO LIST - FASE 5

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

### **FASE 6: Selectores Derivados y Computaciones Memoizadas** 🧮

**Objetivo**: Evitar cálculos repetidos con selectores

#### 📋 TODO LIST - FASE 6

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/selectors.test.ts`
  - [ ] Tests para cálculos actuales de `filteredRows`
  - [ ] Tests para `sortedStages` calculation
  - [ ] Benchmark de performance en cálculos pesados
  - [ ] Ejecutar tests - deben pasar

- [ ] **Implementación Selectores**
  - [ ] Crear `stores/selectors.ts`
    - [ ] `selectFilteredColumns(state, columns)` - memoizado
    - [ ] `selectSortedStages(state, stages)` - memoizado
    - [ ] `selectCanNavigate(state)` - derivados de navegación
    - [ ] `selectVisibleEvents(state, events)` - eventos filtrados

- [ ] **Actualización de Stores**
  - [ ] Agregar selectores a `stage-selection-store.ts`
  - [ ] Agregar selectores a `navigation-store.ts`
  - [ ] Verificar memoización correcta

- [ ] **Refactoring ScheduleGrid**
  - [ ] Eliminar `useMemo` para `filteredRows`
  - [ ] Usar selector `selectFilteredColumns`
  - [ ] Verificar que filtrado sigue funcionando

- [ ] **Refactoring StageSelection**
  - [ ] Eliminar sorting inline
  - [ ] Usar selector `selectSortedStages`
  - [ ] Verificar orden de stages correcto

- [ ] **Testing Post-Fase**
  - [ ] Tests de selectores deben pasar
  - [ ] Benchmark: cálculos pesados solo cuando cambia data
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: filtrado funciona idéntico
  - [ ] Testing manual: sorting funciona idéntico

**Archivos afectados**:

- ✨ `stores/selectors.ts` (nuevo)
- 🔧 `stores/stage-selection-store.ts` (agregar selectores)
- 🔧 `stores/navigation-store.ts` (agregar selectores)
- 🔧 `components/grid/ScheduleGrid.tsx` (usar selectores)
- 🔧 `components/sidebar/StageSelection.tsx` (usar selectores)

**Impacto esperado**: 20-30% mejora en renders con datasets grandes

**Tiempo estimado**: 1 hora

---

### **FASE 7: Sincronización Store con Scroll Navigation** 🔄

**Objetivo**: Coordinar navegación automática con selección

**Issues que resuelve**: CRÍTICO #1 (lógica compleja reimplementada en store)

#### 📋 TODO LIST - FASE 7

- [ ] **Testing Pre-Fase**
  - [ ] Crear `src/features/schedule/ui/__tests__/stores/middleware/navigation-sync.test.ts`
  - [ ] Tests para lógica de auto-navegación actual (ScheduleGrid useEffect)
  - [ ] Tests para casos edge: agregar/remover stages
  - [ ] Crear `src/features/schedule/ui/__tests__/hooks/use-auto-navigation.test.ts`
  - [ ] Ejecutar tests - deben pasar

- [ ] **Implementación Middleware**
  - [ ] Crear `stores/middleware/navigation-sync.ts`
    - [ ] Middleware de Zustand para escuchar `selectedStageIds`
    - [ ] Lógica de auto-navegación cuando se agrega stage
    - [ ] Lógica de auto-navegación cuando se remueve stage
    - [ ] Replicar exactamente el comportamiento del `useEffect` original

- [ ] **Integración con Stores**
  - [ ] Integrar middleware en `stage-selection-store.ts`
  - [ ] Integrar middleware en `navigation-store.ts`
  - [ ] Verificar que coordinación funciona

- [ ] **Hook de Auto-navegación**
  - [ ] Crear `hooks/use-auto-navigation.ts`
    - [ ] Hook que activa la lógica de auto-navegación
    - [ ] Solo usado en ScheduleGrid
    - [ ] Wrapper para el middleware

- [ ] **Refactoring ScheduleGrid**
  - [ ] Eliminar `useEffect` de sincronización (líneas 81-164) - COMPLETAMENTE
  - [ ] Eliminar `previousSelectionRef`
  - [ ] Eliminar `currentColumnRef`
  - [ ] Usar `useAutoNavigation()` hook
  - [ ] Verificar que auto-navegación funciona idéntica

- [ ] **Testing Post-Fase**
  - [ ] Tests de middleware deben pasar
  - [ ] Test auto-navegación: agregar stage navega correctamente
  - [ ] Test auto-navegación: remover stage ajusta posición
  - [ ] Test auto-navegación: selectAll/deselectAll resetea posición
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Testing manual: auto-navegación funciona idéntica

**Archivos afectados**:

- ✨ `stores/middleware/navigation-sync.ts` (nuevo)
- ✨ `hooks/use-auto-navigation.ts` (nuevo)
- 🔧 `stores/stage-selection-store.ts` (integrar middleware)
- 🔧 `stores/navigation-store.ts` (integrar middleware)
- 🔧 `components/grid/ScheduleGrid.tsx` (simplificar masivamente)

**Impacto esperado**: 25% mejora en sincronización, código centralizado y testeable

**Tiempo estimado**: 1.5 horas

---

### **FASE 8: Limpieza y Documentación** 🧹

**Objetivo**: Eliminar código legacy y documentar

#### 📋 TODO LIST - FASE 8

- [ ] **Testing Pre-Fase**
  - [ ] Verificar que no existen imports a archivos que serán eliminados
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar

- [ ] **Eliminación de Legacy**
  - [ ] 🗑️ Eliminar `hooks/use-day-selection.ts`
  - [ ] 🗑️ Eliminar `hooks/use-stage-selection.ts` (old)
  - [ ] 🗑️ Eliminar `hooks/use-event-modal.ts`
  - [ ] 🗑️ Eliminar `hooks/use-stage-navigator.ts`
  - [ ] Verificar que no hay imports rotos

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
  - [ ] Crear `hooks/README.md`
    - [ ] Guía de hooks
    - [ ] Cuándo crear nuevos hooks
    - [ ] Patterns recomendados

- [ ] **Tipos Estrictos**
  - [ ] Revisar todos los stores tengan types explícitos
  - [ ] Eliminar `any` types si existen
  - [ ] Agregar JSDoc comments a funciones públicas

- [ ] **Testing Final**
  - [ ] Ejecutar `pnpm build` - debe pasar
  - [ ] Ejecutar `pnpm test` - debe pasar
  - [ ] Test de integración completa
  - [ ] Verificar bundle size (debe ser menor)
  - [ ] Testing manual: funcionalidad completa idéntica

**Archivos afectados**:

- 🗑️ `hooks/use-day-selection.ts` (eliminar)
- 🗑️ `hooks/use-stage-selection.ts` (eliminar - old)
- 🗑️ `hooks/use-event-modal.ts` (eliminar)
- 🗑️ `hooks/use-stage-navigator.ts` (eliminar)
- ✨ `stores/README.md` (nuevo)
- ✨ `hooks/README.md` (nuevo)
- ✨ `constants.ts` (nuevo)

**Impacto esperado**: 5-10% bundle size reducido, código más mantenible

**Tiempo estimado**: 1 hora

---

## 📊 RESUMEN FINAL

### **Estructura Final de Archivos**

```
src/features/schedule/ui/
├── stores/
│   ├── navigation-store.ts         ✨ NUEVO
│   ├── stage-selection-store.ts    ✨ NUEVO
│   ├── scroll-store.ts             ✨ NUEVO
│   ├── ui-store.ts                 ✨ NUEVO
│   ├── selectors.ts                ✨ NUEVO
│   ├── types.ts                    ✨ NUEVO
│   ├── middleware/
│   │   └── navigation-sync.ts      ✨ NUEVO
│   └── README.md                   ✨ NUEVO
├── hooks/
│   ├── use-navigation.ts           ✨ NUEVO
│   ├── use-stage-selection.ts      ✨ NUEVO (wrapper)
│   ├── use-stage-actions.ts        ✨ NUEVO
│   ├── use-scroll-position.ts      ✨ NUEVO
│   ├── use-drag-handlers.ts        ✨ NUEVO
│   ├── use-modal-control.ts        ✨ NUEVO
│   ├── use-ui-state.ts             ✨ NUEVO
│   ├── use-auto-navigation.ts      ✨ NUEVO
│   ├── use-horizontal-scroll.ts    🔧 REFACTORED (70% reducido)
│   ├── use-container-visibility.ts ✅ MANTENER
│   └── README.md                   ✨ NUEVO
├── utils/
│   └── memo-comparators.ts         ✨ NUEVO
├── constants.ts                    ✨ NUEVO
├── components/                     🔧 TODOS REFACTORED + MEMO
├── adapters/                       ✅ MANTENER
└── types/                          ✅ MANTENER

ELIMINADOS:
❌ hooks/use-day-selection.ts
❌ hooks/use-stage-selection.ts (old)
❌ hooks/use-event-modal.ts
❌ hooks/use-stage-navigator.ts
```

### **Métricas de Impacto Esperadas**

| Métrica                       | Antes     | Después       | Mejora     |
| ----------------------------- | --------- | ------------- | ---------- |
| Re-renders en cambio de stage | ~15-20    | ~3-5          | **70-75%** |
| Re-renders en navegación      | ~10-12    | ~2-3          | **80%**    |
| Re-renders en abrir modal     | ~50+      | 1             | **98%**    |
| Memoria (estados duplicados)  | N × items | Centralizados | **60%**    |
| Líneas en ScheduleGrid        | 270       | ~120          | **55%**    |
| Bundle size                   | Actual    | Reducido      | **5-10%**  |

### **Tiempo Total Estimado**: 10-12 horas

### **Orden de Ejecución**:

```
FASE 0 → FASE 1 → FASE 2 → FASE 3 → FASE 4 → FASE 5 → FASE 6 → FASE 7 → FASE 8
  ⚙️      🗂️       🎭       🖱️       🎨       ⚡       🧮       🔄       🧹
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

## 🎯 ¿LISTO PARA COMENZAR?

Ejecutar: `git status` para verificar estado limpio, luego comenzar con **FASE 0**.
