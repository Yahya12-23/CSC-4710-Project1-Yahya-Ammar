const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateRegistration, validateAgeRange, validateSalaryRange
} = require('../lib/input');

const user = {
  username: 'john', password: 'SafePass123!', firstname: 'John',
  lastname: 'Doe', salary: '52000.50', age: '25'
};

test('valid registration gets normalized', () => {
  const result = validateRegistration(user);
  assert.equal(result.error, undefined);
  assert.equal(result.value.salary, 52000.5);
  assert.equal(result.value.age, 25);
});

test('registration rejects weak passwords', () => {
  assert.match(validateRegistration({ ...user, password: '123' }).error, /Password/);
});

test('registration rejects invalid salary and age', () => {
  assert.ok(validateRegistration({ ...user, salary: '-100' }).error);
  assert.ok(validateRegistration({ ...user, age: '22.5' }).error);
});

test('age range accepts whole ages from 0 to 120', () => {
  const result = validateAgeRange({ min: '18', max: '65' });
  assert.deepEqual(result.value, { min: 18, max: 65 });
});

test('age range rejects missing, reversed or invalid bounds', () => {
  assert.ok(validateAgeRange({ min: '', max: '100' }).error);
  assert.ok(validateAgeRange({ min: '80', max: '20' }).error);
  assert.ok(validateAgeRange({ min: '18.5', max: '65' }).error);
  assert.ok(validateAgeRange({ min: '0; DROP TABLE Users', max: '65' }).error);
  assert.ok(validateAgeRange({ min: '0', max: '121' }).error);
});

test('valid salary range is inclusive and ordered', () => {
  const result = validateSalaryRange({ min: '20000', max: '70000.50' });
  assert.deepEqual(result.value, { min: 20000, max: 70000.5 });
});

test('salary range rejects missing, reversed or invalid bounds', () => {
  assert.ok(validateSalaryRange({ min: '', max: '100' }).error);
  assert.ok(validateSalaryRange({ min: '100', max: '10' }).error);
  assert.ok(validateSalaryRange({ min: '0; DROP TABLE Users', max: '100' }).error);
});
