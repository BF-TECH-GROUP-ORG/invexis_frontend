import WorkersTable from "../layouts/WorkersTable";

export default function WorkersListPage({ companyId }) {
  return (
    <div className="p-6">
      <WorkersTable companyId={companyId} />
    </div>
  );
}
