export default function StepIndicator({
  currentStep,
  steps,
  orientation = "horizontal",
  onStepClick,
  getStepStatus, // Function: (number) => 'complete' | 'unfilled'
  getStepType,   // Function: (number) => 'required' | 'optional'
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
      {steps.map((step, idx) => {
        const status = getStepStatus ? getStepStatus(step.number) : "unfilled";
        const type = getStepType ? getStepType(step.number) : "required";
        const isPassed = step.number < currentStep;
        const isCurrent = step.number === currentStep;

        const isComplete = status === "complete";
        const isRequired = type === "required";
        const isError = isPassed && !isComplete && isRequired;
        const isOptionalUnfilled = isPassed && !isComplete && !isRequired;

        return (
          <div
            key={step.number}
            className={`flex ${
              isVertical ? "flex-col" : "items-center flex-1"
            } relative`}
          >
            {/* Step Item */}
            <button
              type="button"
              onClick={() => onStepClick?.(step.number)}
              disabled={!onStepClick}
              className={`flex items-center text-left transition-all ${
                onStepClick ? "hover:translate-x-1 cursor-pointer" : "cursor-default"
              } ${
                isVertical ? "w-full mb-8 z-10" : "flex-col flex-1 z-10"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all shrink-0 ${
                  isCurrent
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-100"
                    : isError
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : isComplete && isPassed
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                } ${
                  onStepClick && !isCurrent
                    ? isError
                      ? "hover:bg-red-600"
                      : isComplete && isPassed
                      ? "hover:bg-green-600"
                      : "hover:bg-gray-200"
                    : ""
                }`}
              >
                {isError ? (
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : isComplete && isPassed ? (
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
                ) : isOptionalUnfilled ? (
                  <span className="text-gray-400 text-xs font-bold">○</span>
                ) : (
                  step.number
                )}
              </div>
              <div
                className={`ml-3 text-sm font-medium transition-colors ${
                  isVertical ? "text-left" : "mt-2 text-center hidden"
                } ${
                  isCurrent
                    ? "text-orange-600 font-bold"
                    : isError
                    ? "text-red-500 font-bold"
                    : isOptionalUnfilled
                    ? "text-gray-400 font-normal italic"
                    : "text-gray-500 group-hover:text-gray-700"
                }`}
              >
                {step.label}
                {isOptionalUnfilled && (
                  <span className="text-[10px] ml-1 opacity-60">(optional)</span>
                )}
              </div>
            </button>

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
        );
      })}
    </div>
  );
}
