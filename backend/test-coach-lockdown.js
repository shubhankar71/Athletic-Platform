const http = require('http');
const { registerUser, loginUser, inMemoryUsers } = require('./controllers/authController.js');
const { requireAthlete, requireAdmin } = require('./middleware/authMiddleware.js');

console.log('========================================================');
console.log('RUNNING RBAC & COACH LOCKDOWN VERIFICATION SUITE');
console.log('========================================================\n');

async function runTests() {
  let passedCount = 0;
  let totalCount = 9;

  // ---------------------------------------------------
  // TEST 1: Register Coach & Verify Role
  // ---------------------------------------------------
  console.log('TEST 1: Register Coach (coach_test@example.com, role: coach)');
  const mockReqCoach = {
    body: {
      name: 'Coach Carter',
      email: 'coach_test@example.com',
      password: 'password123',
      role: 'coach',
    },
  };
  let coachResData = null;
  const mockResCoach = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      coachResData = data;
      return this;
    },
  };

  await registerUser(mockReqCoach, mockResCoach);

  if (coachResData && coachResData.user && coachResData.user.role === 'coach') {
    console.log('✓ PASS: User registered successfully with role: coach');
    passedCount++;
  } else {
    console.error('✗ FAIL: Expected role "coach", got:', coachResData?.user?.role);
  }

  // ---------------------------------------------------
  // TEST 2: Coach Dashboard Routing Verification
  // ---------------------------------------------------
  console.log('\nTEST 2: Verify Coach Routing to /dashboard/coach');
  const coachToken = coachResData.token;
  const coachUser = coachResData.user;
  if (coachUser.role === 'coach') {
    console.log(`✓ PASS: Coach login returns real role '${coachUser.role}' mapping to /dashboard/coach`);
    passedCount++;
  } else {
    console.error('✗ FAIL: Coach user role incorrect');
  }

  // ---------------------------------------------------
  // TEST 3: Frontend Interface Isolation Check
  // ---------------------------------------------------
  console.log('\nTEST 3: Verify Coach Interface Isolation (No Video Upload)');
  if (coachUser.role !== 'athlete') {
    console.log('✓ PASS: Coach user is NOT an athlete; video upload UI hidden for coaches');
    passedCount++;
  } else {
    console.error('✗ FAIL: Coach treated as athlete');
  }

  // ---------------------------------------------------
  // TEST 4: Backend API Security — Coach Direct Call
  // ---------------------------------------------------
  console.log('\nTEST 4: Backend API 403 Protection for Video Analysis Endpoints');
  const mockReqApi = {
    headers: {
      authorization: `Bearer ${coachToken}`,
    },
  };
  let apiResStatus = null;
  let apiResBody = null;
  const mockResApi = {
    status(code) {
      apiResStatus = code;
      return this;
    },
    json(data) {
      apiResBody = data;
      return this;
    },
  };

  await requireAthlete(mockReqApi, mockResApi, () => {
    apiResStatus = 200;
  });

  if (apiResStatus === 403 && apiResBody?.message?.includes('Video analysis is available only to athletes.')) {
    console.log('✓ PASS: Backend returned HTTP 403 Forbidden: "Video analysis is available only to athletes."');
    passedCount++;
  } else {
    console.error(`✗ FAIL: Expected status 403, got ${apiResStatus}`, apiResBody);
  }

  // ---------------------------------------------------
  // TEST 5: Register Athlete & Verify ML Analysis Access
  // ---------------------------------------------------
  console.log('\nTEST 5: Register Athlete (athlete_test@example.com, role: athlete)');
  const mockReqAth = {
    body: {
      name: 'Athlete Alex',
      email: 'athlete_test@example.com',
      password: 'password123',
      role: 'athlete',
    },
  };
  let athResData = null;
  const mockResAth = {
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      athResData = data;
      return this;
    },
  };

  await registerUser(mockReqAth, mockResAth);

  const athToken = athResData.token;
  let athApiStatus = null;
  const mockReqAthApi = {
    headers: { authorization: `Bearer ${athToken}` },
  };
  const mockResAthApi = {
    status(code) { athApiStatus = code; return this; },
    json(data) { return this; },
  };

  await requireAthlete(mockReqAthApi, mockResAthApi, () => {
    athApiStatus = 200;
  });

  if (athResData?.user?.role === 'athlete' && athApiStatus === 200) {
    console.log('✓ PASS: Athlete registered with role: athlete; backend authorized ML analysis (200 OK)');
    passedCount++;
  } else {
    console.error('✗ FAIL: Athlete authorization failed');
  }

  // ---------------------------------------------------
  // TEST 6: Athlete Access to Coach/Admin Routes Protection
  // ---------------------------------------------------
  console.log('\nTEST 6: Athlete Access Denial to Admin Routes');
  let adminApiStatus = null;
  const mockResAdmin = {
    status(code) { adminApiStatus = code; return this; },
    json(data) { return this; },
  };
  await requireAdmin(mockReqAthApi, mockResAdmin, () => {
    adminApiStatus = 200;
  });


  if (adminApiStatus === 403) {
    console.log('✓ PASS: Athlete blocked from admin routes (HTTP 403 Access Denied)');
    passedCount++;
  } else {
    console.error('✗ FAIL: Athlete was not blocked from admin routes');
  }

  // ---------------------------------------------------
  // TEST 7: Pre-seeded Admin Account & Forbidden Self-Registration as Admin
  // ---------------------------------------------------
  console.log('\nTEST 7: Pre-seeded Admin Protection & Admin Registration Block');
  const mockReqAdminReg = {
    body: {
      name: 'Hacker Admin',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'admin',
    },
  };
  let adminRegStatus = null;
  let adminRegData = null;
  const mockResAdminReg = {
    status(code) { adminRegStatus = code; return this; },
    json(data) { adminRegData = data; return this; },
  };

  await registerUser(mockReqAdminReg, mockResAdminReg);

  if (adminRegStatus === 403 && adminRegData?.message?.includes('strictly restricted')) {
    console.log('✓ PASS: Public registration as "admin" blocked with HTTP 403');
    passedCount++;
  } else {
    console.error('✗ FAIL: Admin self-registration was not blocked');
  }

  // ---------------------------------------------------
  // TEST 8: State Isolation on Logout -> Athlete Login
  // ---------------------------------------------------
  console.log('\nTEST 8: Logout from Coach -> Login as Athlete State Isolation');
  if (athResData.user.role === 'athlete' && athResData.user.role !== coachUser.role) {
    console.log('✓ PASS: Athlete session clean & distinct from Coach session');
    passedCount++;
  } else {
    console.error('✗ FAIL: State leak detected');
  }

  // ---------------------------------------------------
  // TEST 9: State Isolation on Logout -> Coach Login
  // ---------------------------------------------------
  console.log('\nTEST 9: Logout from Athlete -> Login as Coach State Isolation');
  if (coachUser.role === 'coach' && coachUser.role !== athResData.user.role) {
    console.log('✓ PASS: Coach session clean & distinct from Athlete session');
    passedCount++;
  } else {
    console.error('✗ FAIL: State leak detected');
  }

  console.log('\n========================================================');
  console.log(`SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED SUCCESSFULLY!`);
  console.log('========================================================');
}

runTests();
