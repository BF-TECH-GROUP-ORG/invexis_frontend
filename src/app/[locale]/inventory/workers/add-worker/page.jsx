"use client"

import React from 'react'
import AddWorkerForm from '@/components/forms/AddWorkerForm'
import { useRouter } from 'next/navigation'
import { createWorker } from '@/services/workersService'

const AddWorker = () => {
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

export default AddWorker
