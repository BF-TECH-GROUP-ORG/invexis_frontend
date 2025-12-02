E-commerce pages added under src/app/[locale]/inventory/ecommerce

Created pages (paths):
- /inventory/ecommerce (index)
- /inventory/ecommerce/overview
- /inventory/ecommerce/products
- /inventory/ecommerce/inventory_management
- /inventory/ecommerce/customer_management
- /inventory/ecommerce/order_management
- /inventory/ecommerce/payments_and_finance
- /inventory/ecommerce/shippint_and_logistics  (keeps existing sidebar typo)
- /inventory/ecommerce/marketing_management
- /inventory/ecommerce/reveiews  (keeps existing sidebar typo)

Notes:
- Pages are implemented using React + Recharts for charts and simple HTML tables for tabular data.
- The pages are client components ("use client").
- To view these pages in dev, start the dev server and open the corresponding URLs for a locale (eg `/en/inventory/ecommerce/overview`).
- These are placeholder/sample UI pages and will need real data wiring to the backend APIs.
