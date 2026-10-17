// Pick the previous month so its default day (the 15th) has passed on every day this month.
// Parent onboarding stays age 14; teen paths stay age 12 or 15 regardless of the calendar year.
const now = new Date();
const month = (now.getMonth() + 11) % 12;
const yearForAge = (age) => now.getFullYear() - age - (now.getMonth() === 0 ? 1 : 0);
const monthYear = (age) => `${String(month + 1).padStart(2, '0')}${yearForAge(age)}`;
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

output.birthMonthYear = {
  parent: monthYear(14),
  teenUnder13: monthYear(12),
  teen13Plus: monthYear(15),
};
output.today = today;
