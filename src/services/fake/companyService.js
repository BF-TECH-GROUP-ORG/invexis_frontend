import companiesData from "@/db/companies.json"

let companies = [...companiesData]

export const companyService = {
  getCompanies: async () => companies,

  getCompanyById: async (id) => companies.find((c) => c.id === id),

  updateTier: async (id, newTier) => {
    const company = companies.find((c) => c.id === id);
    if (!company) throw new Error("Not found");
    company.tier = newTier;
    return company;
  }
};