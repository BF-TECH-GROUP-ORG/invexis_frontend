export default function StepNavigation({
  currentStep,
  totalSteps,
  showReview,
  isValid,
  isSubmitting,
  onNext,
  onPrevious,
  onSubmit,
}) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep === 1 && !showReview}
        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Previous
      </button>

      <div className="text-sm text-gray-600">
        {showReview ? (
          <span className="font-semibold">Review & Submit</span>
        ) : (
          <span>
            Step {currentStep} of {totalSteps}
          </span>
        )}
      </div>

      {showReview ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          {isSubmitting ? "Submitting..." : "Submit Product"}
        </button>
      ) : currentStep < totalSteps ? (
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Next Step
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          Review & Submit
        </button>
      )}
    </div>
  );
}
