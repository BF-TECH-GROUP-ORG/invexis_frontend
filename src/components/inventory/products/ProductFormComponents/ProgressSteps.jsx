// src/components/inventory/products/ProductFormComponents/ProgressSteps.jsx
"use client";

import { Package, List, DollarSign, Image as ImageIcon, Layers, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

  const t = useTranslations("products.form");
  const STEPS = [
  { id: 1, title: t("fields.stepBasic"), icon: Package },
  { id: 2, title: t("fields.stepAttr"), icon: List },
  { id: 3, title: t("fields.stepInv"), icon: DollarSign },
  { id: 4, title: t("fields.stepMedia"), icon: ImageIcon },
  { id: 5, title: t("fields.stepVar"), icon: Layers },
  { id: 6, title: t("fields.stepAdv"), icon: Shield },
];

  return (
    <div className="bg-white border-b">
      <div className="flex items-center px-6 py-4">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${isActive ? "bg-orange-500 text-white ring-4 ring-orange-200" :
                    isCompleted ? "bg-green-500 text-white" :
                      "bg-gray-200 text-gray-500"
                  }`}>
                  <Icon size={20} />
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? "text-orange-600" :
                    isCompleted ? "text-green-600" :
                      "text-gray-500"
                  }`}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded transition-all ${isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}