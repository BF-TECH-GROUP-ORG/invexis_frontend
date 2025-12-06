import WorkersListPage from "@/components/pages/WorkersListPage";
import WorkersProtectedWrapper from "@/components/clients/WorkersProtectedWrapper";

export const metadata = {
  title: "Workers List",
};

const WorkersList = () => {
  return (
    <div>
      <WorkersProtectedWrapper />
    </div>
  );
};

export default WorkersList;
