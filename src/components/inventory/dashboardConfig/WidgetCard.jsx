// src/components/inventory/dashboardConfig/WidgetCard.jsx
"use client";

import React from "react";
import { GripVertical, Eye, EyeOff, Settings } from "lucide-react";

export default function WidgetCard({
    widget,
    onToggle = () => { },
    onSettings = () => { },
    isDragging = false
}) {
    const Icon = widget.icon;

    return (
        <div
            className={`bg-white border rounded-xl p-4 transition-all ${isDragging
                    ? "border-orange-400 shadow-lg shadow-orange-100"
                    : widget.enabled
                        ? "border-gray-200 hover:border-orange-300"
                        : "border-gray-100 bg-gray-50 opacity-60"
                }`}
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical size={20} />
                </div>

                {/* Widget Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${widget.enabled ? "bg-orange-100" : "bg-gray-100"
                    }`}>
                    {Icon && <Icon size={20} className={widget.enabled ? "text-orange-600" : "text-gray-400"} />}
                </div>

                {/* Widget Info */}
                <div className="flex-1 min-w-0">
                    <h4 className={`font-medium truncate ${widget.enabled ? "text-gray-900" : "text-gray-500"}`}>
                        {widget.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{widget.description}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onSettings(widget)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Settings"
                    >
                        <Settings size={16} />
                    </button>

                    <button
                        onClick={() => onToggle(widget.id)}
                        className={`p-2 rounded-lg transition-colors ${widget.enabled
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }`}
                        title={widget.enabled ? "Hide Widget" : "Show Widget"}
                    >
                        {widget.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
