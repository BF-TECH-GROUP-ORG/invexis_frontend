export default function StepIndicator({
  currentStep,
  steps,
  orientation = "horizontal",
}) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={`flex ${
        isVertical
          ? "flex-col space-y-0 items-start"
          : "items-center justify-between"
      }`}
    >
      {steps.map((step, idx) => (
        <div
          key={step.number}
          className={`flex ${
            isVertical ? "flex-col" : "items-center flex-1"
          } relative`}
        >
          {/* Step Item */}
          <div
            className={`flex items-center ${
              isVertical ? "w-full mb-8 z-10" : "flex-col flex-1 z-10"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors shrink-0 ${
                currentStep === step.number
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                  : currentStep > step.number
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-400 border border-gray-200"
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
              className={`ml-3 text-sm font-medium ${
                isVertical ? "text-left" : "mt-2 text-center hidden" // Hide label in horizontal to save space or keep if needed, specific requests didn't specify, but vertical usually has label next to bubble
              } ${
                currentStep === step.number
                  ? "text-orange-600 font-bold"
                  : "text-gray-500"
              }`}
            >
              {step.label}
            </div>
          </div>

          {/* Connector Line */}
          {idx < steps.length - 1 && (
            <div
              className={`transition-colors absolute ${
                isVertical
                  ? "w-0.5 h-full left-5 top-10 -ml-px"
                  : "h-1 flex-1 mx-2 top-5 left-1/2 right-1/2 w-full" // Horizontal lines are tricky with flex-1 approach, reverting to simple flex logic if horizontal
              } ${
                !isVertical && "relative h-1 flex-1 mx-2 hidden" // Simplified for horizontal based on previous logic, but let's just use the previous logic for horizontal if possible or adapt
              } ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"}`}
              style={
                !isVertical
                  ? {
                      position: "static",
                      height: "4px",
                      flex: 1,
                      margin: "0 8px",
                    }
                  : {}
              }
            />
          )}

          {/* Horizontal Connector (Legacy support fallback) */}
          {!isVertical && idx < steps.length - 1 && (
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
