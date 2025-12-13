export default function StepIndicator({ currentStep, totalSteps }) {
  const steps = [
    { number: 1, label: "Basic Info" },
    { number: 2, label: "Media" },
    { number: 3, label: "Pricing" },
    { number: 4, label: "Inventory" },
    { number: 5, label: "Category" },
    { number: 6, label: "Specifications" },
    { number: 7, label: "SEO" },
  ];

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, idx) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                currentStep === step.number
                  ? "bg-orange-500 text-white"
                  : currentStep > step.number
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {currentStep > step.number ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.number
              )}
            </div>
            <div
              className={`text-xs mt-2 text-center ${
                currentStep === step.number
                  ? "font-semibold text-orange-500"
                  : "text-gray-600"
              }`}
            >
              {step.label}
            </div>
          </div>

          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 transition-colors ${
                currentStep > step.number ? "bg-green-500" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
