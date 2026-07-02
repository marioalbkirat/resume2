interface StepNavigationProps { currentStep: number; totalSteps: number; onNext: () => void; onPrev: () => void; onSubmit: () => void; isLastStep: boolean; canGoNext: boolean; }
export default function StepNavigation({ currentStep, totalSteps, onNext, onPrev, onSubmit, isLastStep, canGoNext }: StepNavigationProps) {
    return (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <button type="button" onClick={onPrev} disabled={currentStep === 1} className={`px-6 py-2 rounded-lg transition 
            ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Previous
            </button>
            <div className="flex gap-2">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                    <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm 
                        ${step === currentStep ? 'bg-blue-500 text-white' : step < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {step < currentStep ? '✓' : step}
                    </div>
                ))}
            </div>
            {!isLastStep ? (
                <button type="button" onClick={onNext} disabled={!canGoNext} className={`px-6 py-2 rounded-lg transition 
                    ${canGoNext ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                    Next
                </button>
            ) : (
                <button type="button" onClick={onSubmit} className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                    Create Template
                </button>
            )}
        </div>
    );
}