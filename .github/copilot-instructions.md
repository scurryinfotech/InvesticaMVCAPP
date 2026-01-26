# Copilot Instructions

## General Guidelines
- Prioritize Razor Pages when relevant, as the project is Razor Pages-oriented but also contains MVC controllers.
- Use C# code targeting .NET 10, as the user works in Visual Studio 2026.
- Prefer displaying role names in the UI while the backend continues to use role IDs. The frontend should fetch roles via `service.GetRolesAsync`, map IDs to names, and present a role dropdown with values as role IDs.
- Use `Service.GetCompaniesAsync` to populate the company select on the Dashboard and `Service.GetTicketByIdAsync` to perform ticket searches from the Dashboard UI.
- When the Dashboard Next is clicked, show navigation tabs: Dashboard, Companies, Other Details, Summary, and Admin Panel. Otherwise, by default show: Dashboard, Tickets, Invoice, Fontsheet, Links, Renewals, Admin Panel.
- When navigating from Companies to Other Details, include `companyId`, `licenseTypeId`, `statusId`, and `companyAddress` in the query string. The Other Details page must parse these query parameters on load, populate display fields, and save values to localStorage so the browser Back/Forward restores state.

## Code Style
- Follow specific formatting rules.
- Adhere to naming conventions.

## Database Operations
- Prefer ADO.NET with parameterized queries (no stored procedures) for CRUD operations; use this style when generating repository code.
- Implement repositories and services in the `Repository\Service\Service.cs` structure, using the `Investica.Models` namespace for model classes.