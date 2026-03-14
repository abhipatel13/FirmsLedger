import RequestProposal from '@/views/RequestProposal';

export const metadata = {
  title: 'Request a Proposal',
  robots: { index: false, follow: true },
};

export default function RequestProposalPage({ searchParams }) {
  return <RequestProposal searchParams={searchParams} />;
}
