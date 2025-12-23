import LogsPageClient from "./LogsPageClient";

export const metadata = {
    title: "Audit Logs | INVEXIS",
    description: "View and filter system audit logs",
};

const LogsPage = () => {
    return <LogsPageClient />;
};

export default LogsPage;
