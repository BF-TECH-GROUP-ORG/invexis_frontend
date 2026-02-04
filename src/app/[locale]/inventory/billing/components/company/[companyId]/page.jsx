'use client';

import { useParams } from 'next/navigation';
import CompanyPaymentsClient from '../CompanyPaymentsClient';

export default function CompanyPaymentsPage() {
  const params = useParams();
  const companyId = params?.companyId;

  if (!companyId) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <h1>Invalid Company ID</h1>
        <p>Please provide a valid company ID in the URL.</p>
      </div>
    );
  }

  return <CompanyPaymentsClient companyId={companyId} />;
}
