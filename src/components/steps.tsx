import { useState } from 'react';

interface StepNavigatorProps {
    totalSteps: number;
    isButtonDisabled: (step: number) => boolean;
    nextButtonText: string;
    backButtonText: string;
    onStepChange: (step: number) => void;
    handleSubmit?: any
}

export default function StepNavigator(props: StepNavigatorProps) {
    const {
        totalSteps,
        isButtonDisabled,
        nextButtonText,
        backButtonText,
        onStepChange,
        handleSubmit
    } = props;

    const [step, setStep] = useState(1);

    const handleNext = () => {
        if (step === totalSteps) {
            handleSubmit
        } else if (step < totalSteps) {
            setStep(step + 1);
            onStepChange(step + 1);
        }
    };

    const handlePrevious = () => {
        if (step > 1) {
            setStep(step - 1);
            onStepChange(step - 1); // Chama a função para notificar o passo atual
        }
    };
    

    return (
        <div className="mt-10 flex justify-between">
            <button
                className="btn"
                onClick={handlePrevious}
                disabled={step === 1}
            >
                {backButtonText}
            </button>
            <div className="tooltip tooltip-bottom" data-tip={isButtonDisabled(step) ? "Preencha todos os campos obrigatórios" : null}>
                <button
                    className={`btn ${step === totalSteps ? 'btn-success' : ''}`}
                    onClick={handleNext}
                    disabled={isButtonDisabled(step)}
                >
                    {nextButtonText}
                </button>
            </div>
        </div>
    );
}
