import WorkersTable from "../layouts/WorkersTable";

export default function WorkersListPage({ initialParams }) {
  return (
    <div className="pt-2 mx-auto">
      <WorkersTable initialParams={initialParams} />
    </div>
  );
}
