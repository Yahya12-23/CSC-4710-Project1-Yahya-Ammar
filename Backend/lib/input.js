
function textField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validMoney(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const raw = String(value).trim();
  if (!/^\d{1,10}(\.\d{1,2})?$/.test(raw)) return null;
  const amount = Number(raw);
  return Number.isFinite(amount) && amount <= 9999999999.99 ? amount : null;
}

function validateRegistration(body = {}) {
  const username = textField(body.username);
  const firstname = textField(body.firstname);
  const lastname = textField(body.lastname);
  const password = typeof body.password === 'string' ? body.password : '';
  const salary = validMoney(body.salary);
  const ageRaw = String(body.age ?? '').trim();
  const age = /^\d+$/.test(ageRaw) ? Number(ageRaw) : NaN;

  if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
    return { error: 'Username must be 3–50 characters (letters, digits, underscores).' };
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return { error: 'Password must be at least 8 characters and at most 72 UTF-8 bytes.' };
  }
  if (!firstname || firstname.length > 50 || !lastname || lastname.length > 50) {
    return { error: 'First and last names are required (maximum 50 characters each).' };
  }
  if (salary === null) {
    return { error: 'Salary must be a non-negative number with at most 2 decimal places.' };
  }
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    return { error: 'Age must be a whole number from 0 to 120.' };
  }
  return { value: { username, password, firstname, lastname, salary, age } };
}

function validateSalaryRange(query = {}) {
  const min = validMoney(query.min);
  const max = validMoney(query.max);
  if (min === null || max === null) {
    return { error: 'Enter valid minimum and maximum salaries (up to 2 decimals).' };
  }
  if (min > max) return { error: 'Minimum salary cannot be greater than maximum salary.' };
  return { value: { min, max } };
}

module.exports = { textField, validateRegistration, validateSalaryRange };
