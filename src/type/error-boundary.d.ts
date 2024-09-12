// src/type/error-boundary.d.ts
declare interface ErrorBoundaryProps {
    children: null;
}

declare interface ErrorBoundaryState {
    hasError: boolean;
    errorTitle: string | null;
    errorLocation: string | null;
    errorStage: 'Inicialização' | 'Renderização' | 'Utilização' | null;
    showToast: boolean;
}