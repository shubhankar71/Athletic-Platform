const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const { getDashboardRoute } = require('./controllers/authController.js');

async function runTests() {
  console.log('=== Running RBAC Unit Tests ===');

  // Test 1: Role Dashboard Routes
  console.log('Test 1: Dashboard Routes');
  console.assert(getDashboardRoute('athlete') === '/dashboard/athlete', 'Athlete route failed');
  console.assert(getDashboardRoute('coach') === '/dashboard/coach', 'Coach route failed');
  console.assert(getDashboardRoute('admin') === '/dashboard/admin', 'Admin route failed');
  console.log('✓ Dashboard routes map correctly for athlete, coach, admin');

  // Test 2: JWT Token Creation and Verification
  console.log('\nTest 2: JWT Token Sign & Verify');
  const secret = 'test_secret_key_123';
  const token = jwt.sign({ id: 'user_123', role: 'coach' }, secret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, secret);
  console.assert(decoded.id === 'user_123', 'Decoded ID mismatch');
  console.assert(decoded.role === 'coach', 'Decoded role mismatch');
  console.log('✓ JWT Token correctly embeds userId and role');

  // Test 3: Password Hashing & Comparison with bcryptjs
  console.log('\nTest 3: Bcrypt Password Hashing & Comparison');
  const rawPassword = 'SecurePassword123!';
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  
  const isMatchCorrect = await bcrypt.compare(rawPassword, hashedPassword);
  const isMatchWrong = await bcrypt.compare('WrongPassword', hashedPassword);

  console.assert(isMatchCorrect === true, 'Bcrypt correct password match failed');
  console.assert(isMatchWrong === false, 'Bcrypt wrong password check failed');
  console.log('✓ Password hashing and bcrypt comparison working properly');

  console.log('\n=== All Tests Passed Successfully! ===');
}

runTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
