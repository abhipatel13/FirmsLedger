import { Suspense } from 'react';
import RequestProposalForm from '@/components/RequestProposalForm';

export const metadata = {
  title: 'Request a Proposal',
  robots: { index: false, follow: false },
};

export default function RequestProposalPage() {
  return (
    <Suspense fallback={null}>
      <RequestProposalForm />
    </Suspense>
  );
}
