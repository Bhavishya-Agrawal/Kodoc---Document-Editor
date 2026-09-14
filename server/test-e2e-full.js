const BASE_URL = "http://localhost:5000/api";

async function post(url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

async function get(url, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

async function put(url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "PUT", headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

async function patch(url, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "PATCH", headers, body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

async function del(url, token) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method: "DELETE", headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

async function runEndToEndTests() {
  console.log("==================================================");
  console.log("  KODOC FULL-STACK END-TO-END VALIDATION SUITE   ");
  console.log("==================================================\n");

  const timestamp = Date.now();
  const testUser = {
    username: `student_${timestamp}`,
    email: `student_${timestamp}@example.com`,
    password: "password123",
  };

  try {
    // 1. Register / Signup
    console.log("1. Testing User Registration...");
    const regRes = await post(`${BASE_URL}/auth/signup`, testUser);
    console.log("   ✓ User registered successfully:", regRes.user.username);
    const token = regRes.token;

    // 2. Profile Fetch & Update
    console.log("\n2. Testing User Profile & Stats Retrieval...");
    const profileRes = await get(`${BASE_URL}/profile`, token);
    console.log("   ✓ Profile retrieved:", profileRes.user.email);
    console.log("   ✓ Initial stats:", profileRes.stats);

    console.log("\n3. Testing Profile Update (FullName, Bio)...");
    const updateProfileRes = await put(
      `${BASE_URL}/profile`,
      {
        username: testUser.username,
        fullName: "Bhavishya Agrawal",
        bio: "4th-Year B.Tech CSE student building versioned document platforms",
      },
      token
    );
    console.log("   ✓ Updated profile fullName:", updateProfileRes.user.fullName);
    console.log("   ✓ Updated profile bio:", updateProfileRes.user.bio);

    // 4. Create Document
    console.log("\n4. Testing Document Creation...");
    const createDocRes = await post(
      `${BASE_URL}/documents`,
      { title: "Distributed Consensus Protocols" },
      token
    );
    const doc = createDocRes.document;
    const docId = doc._id;
    console.log(`   ✓ Created document: "${doc.title}" (ID: ${docId}, v${doc.currentVersion})`);

    // 5. Commit Version 1
    console.log("\n5. Testing First Version Commit (Milestone 1)...");
    const contentV1 =
      "<h1>Distributed Consensus</h1><p>Paxos and Raft are consensus algorithms for replicated state machines.</p>";
    const v1Res = await post(
      `${BASE_URL}/documents/${docId}/versions`,
      { content: contentV1, commitMessage: "Initial draft covering Paxos and Raft overview" },
      token
    );
    console.log(`   ✓ Committed v${v1Res.version.versionNumber} (wordCount: ${v1Res.version.wordCount})`);

    // 6. Commit Version 2
    console.log("\n6. Testing Second Version Commit (Milestone 2)...");
    const contentV2 =
      "<h1>Distributed Consensus</h1><p>Paxos and Raft are consensus algorithms for replicated state machines.</p><p>Raft decomposes consensus into leader election, log replication, and safety guarantees.</p>";
    const v2Res = await post(
      `${BASE_URL}/documents/${docId}/versions`,
      {
        content: contentV2,
        commitMessage: "Add detailed breakdown of Raft three-phase consensus",
      },
      token
    );
    console.log(`   ✓ Committed v${v2Res.version.versionNumber} (wordCount: ${v2Res.version.wordCount})`);

    // 7. Test Version Rollback / Restore
    console.log("\n7. Testing Version Restore / Rollback to v1...");
    const restoreRes = await post(
      `${BASE_URL}/documents/${docId}/versions/${v1Res.version._id}/restore`,
      { commitMessage: "Rollback to initial v1 draft" },
      token
    );
    console.log(
      `   ✓ Restored as v${restoreRes.version.versionNumber} (restoredFrom: v${restoreRes.version.restoredFromVersionNumber})`
    );

    // 8. Test Star Document
    console.log("\n8. Testing Toggle Star / Favorite Document...");
    const starRes = await patch(
      `${BASE_URL}/documents/${docId}/star`,
      {},
      token
    );
    console.log(`   ✓ Document starred status: ${starRes.document.isStarred}`);

    // 9. Test Duplicate Document
    console.log("\n9. Testing Document Duplication...");
    const dupRes = await post(
      `${BASE_URL}/documents/${docId}/duplicate`,
      {},
      token
    );
    const duplicatedDoc = dupRes.document;
    console.log(`   ✓ Duplicated document: "${duplicatedDoc.title}" (ID: ${duplicatedDoc._id})`);

    // 10. Test Stats After Operations
    console.log("\n10. Testing Workspace Stats API...");
    const statsRes = await get(`${BASE_URL}/stats`, token);
    console.log("   ✓ Workspace Stats:", statsRes);

    // 11. Clean Up (Delete Documents)
    console.log("\n11. Testing Document Deletion...");
    await del(`${BASE_URL}/documents/${docId}`, token);
    await del(`${BASE_URL}/documents/${duplicatedDoc._id}`, token);
    console.log("   ✓ Successfully deleted test documents.");

    console.log("\n==================================================");
    console.log("  ALL FULL-STACK SYSTEM TESTS PASSED PERFECTLY!   ");
    console.log("==================================================\n");
  } catch (err) {
    console.error("Test failed:", err.message);
    process.exit(1);
  }
}

runEndToEndTests();
