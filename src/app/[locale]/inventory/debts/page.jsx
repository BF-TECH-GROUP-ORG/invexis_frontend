import DebtCards from "./cards";
import DataTable from "./table";
import { useTranslations } from "next-intl";
const DebtsPage = () => {
  const t = useTranslations("debtsPage");
  return <>
<DebtCards />
<div className="pt-10 pl-3 pb-5">
    <h1 className="text-2xl font-bold">{t('title')}</h1>
    <p className="text-gray-700">{t('subtitle')}</p>

</div>

 <DataTable /> 
  
  </>
}
export default DebtsPage;