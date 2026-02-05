"use client"

import React, { Suspense } from 'react'
import AddWorkerForm from '@/components/forms/AddWorkerForm'
import { useRouter } from 'next/navigation'
import { createWorker } from '@/services/workersService'

function AddWorkerContent() {
  const router = useRouter()

  const handleOnSubmit = async (workerData) => {
    try {
      await createWorker(workerData);
      // Optionally show success message or wait a bit
      router.push('/inventory/workers/list')
    } catch (error) {
      console.error("Failed to create worker", error);
      throw error; // Form will handle the error display
    }
  }

  return (
    <div>
      <AddWorkerForm onSubmit={handleOnSubmit} />
    </div>
  )
}

export default function AddWorker() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
      <AddWorkerContent />
    </Suspense>
  );
}
