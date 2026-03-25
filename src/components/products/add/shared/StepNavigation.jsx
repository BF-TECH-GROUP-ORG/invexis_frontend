export default function StepNavigation({
  currentStep,
  totalSteps,
  isValid,
  isSubmitting,
  isEdit = false,
  allStepsValid = true,
  onNext,
  onPrevious,
  onBackToList,
  onSubmit,
}) {
  return (
    <div className="flex items-center justify-between">
      {currentStep === 1 ? (
        <button
          type="button"
          onClick={onBackToList}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
        >
          Back to Products
        </button>
      ) : (
        <button
          type="button"
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>
      )}

      <div className="text-sm text-gray-600">
        {currentStep === totalSteps ? (
          <span className="font-semibold">{isEdit ? "Review & Update" : "Review & Submit"}</span>
        ) : (
          <span>
            Step {currentStep} of {totalSteps}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-3">
        {/* Only show Update directly if in edit mode and NOT on the last step (which already has the submit button) */}
        {isEdit && currentStep !== totalSteps && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || !isValid}
            className="px-6 py-2 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold border border-orange-200"
          >
            {isSubmitting ? "Updating..." : "Update Product"}
          </button>
        )}

        {currentStep === totalSteps ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting || (!isEdit && !allStepsValid)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {isSubmitting ? (isEdit ? "Updating..." : "Submitting...") : (isEdit ? "Update Product" : "Submit Product")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={!isValid}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            Next Step
          </button>
        )}
      </div>
    </div>
  );
}
