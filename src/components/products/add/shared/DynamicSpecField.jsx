export default function DynamicSpecField({ spec, value, onChange }) {
  const handleChange = (e) => {
    let val;

    switch (spec.type) {
      case "number":
        val = e.target.value === "" ? null : parseFloat(e.target.value);
        break;
      case "boolean":
        val = e.target.checked;
        break;
      default:
        val = e.target.value;
    }

    onChange(spec.key, val);
  };

  const renderField = () => {
    switch (spec.type) {
      case "string":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={value || ""}
              onChange={handleChange}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={`Enter ${spec.label.toLowerCase()}`}
            />
            {spec.unit && (
              <span className="text-gray-600 text-sm">{spec.unit}</span>
            )}
          </div>
        );

      case "number":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={value ?? ""}
              onChange={handleChange}
              step="any"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={`Enter ${spec.label.toLowerCase()}`}
            />
            {spec.unit && (
              <span className="text-gray-600 text-sm font-medium">
                {spec.unit}
              </span>
            )}
          </div>
        );

      case "boolean":
        return (
          <div className="flex items-center">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value || false}
                onChange={handleChange}
                className="w-5 h-5 text-orange-500 rounded focus:ring-2 focus:ring-orange-500"
              />
              <span className="text-gray-700">Yes</span>
            </label>
          </div>
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="">Select {spec.label.toLowerCase()}</option>
            {spec.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {spec.label}
        {spec.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
    </div>
  );
}
