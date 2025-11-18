"use client"

import React from 'react'
import AddWorkerForm from '@/components/forms/AddWorkerForm'
import { useRouter } from 'next/navigation'

const AddWorker = () => {
    const router = useRouter()
    const handleOnSubmit = () => {
        router.push('/inventory/workers/list')
    }
  return (
    <div>
      <AddWorkerForm onSubmit={handleOnSubmit} />
    </div>
  )
}

export default AddWorker
