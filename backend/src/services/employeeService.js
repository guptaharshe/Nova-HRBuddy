const employees = require('../data/employees.json');

// Build a lookup map keyed by email for O(1) access
const employeesByEmail = {};
employees.forEach((emp) => {
  employeesByEmail[emp.email] = emp;
});

/**
 * Returns the employee profile for the given email, or null if not found.
 * This is always called with the verified email from the JWT — never
 * with a value from the request body.
 */
const getByEmail = (email) => {
  return employeesByEmail[email] || null;
};

module.exports = { getByEmail };
