import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        window.location.href = "/";
    };

    private handleFullReset = () => {
        try {
            // Clear persistence which might be causing the crash
            localStorage.removeItem('bochel_credit_form_data');
            localStorage.removeItem('bochel_credit_form_step');
            sessionStorage.clear();
            window.location.href = "/";
        } catch (e) {
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 font-sans">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h1>
                        <p className="text-gray-500 mb-8 text-sm">
                            O sistema encontrou um erro inesperado no seu dispositivo. Não se preocupe, os seus dados principais estão seguros.
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={this.handleReset}
                                className="w-full gap-2 bg-[#1b5e20] hover:bg-[#144517] text-white py-6 rounded-xl shadow-md transition-all active:scale-95"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Recarregar App
                            </Button>

                            <Button
                                variant="outline"
                                onClick={this.handleFullReset}
                                className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 py-6 rounded-xl transition-all active:scale-95"
                            >
                                <Trash2 className="h-4 w-4" />
                                Limpar Cache e Reiniciar
                            </Button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-100 italic text-[10px] text-gray-400">
                            Erro: {this.state.error?.message || "Erro desconhecido de execução"}
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
