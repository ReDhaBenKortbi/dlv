const fetch = require("node-fetch");
const admin = require("firebase-admin");

// 1. IMPROVED FIREBASE ADMIN INITIALIZATION
if (!admin.apps.length) {
  try {
    console.log("🔑 Private Key Check:", {
      exists: !!process.env.FIREBASE_PRIVATE_KEY,
      startsCorrectly:
        process.env.FIREBASE_PRIVATE_KEY?.startsWith("-----BEGIN"),
      length: process.env.FIREBASE_PRIVATE_KEY?.length,
    });

    const cleanKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n").replace(/"/g, "")
      : undefined;

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: cleanKey,
      }),
    });
    console.log("✅ Firebase Admin Initialized Successfully");
  } catch (initError) {
    console.error("❌ Firebase Admin Init Error:", initError.message);
  }
}

exports.handler = async (event) => {
  try {
    const { id, token } = event.queryStringParameters || {};

    // 2. SECURITY: Referer Check - USE ENVIRONMENT VARIABLE
    const SITE_URL = process.env.VITE_API_URL || "https://dlvdz.netlify.app";
    const referer = event.headers.referer || event.headers.referrer || "";

    // DEBUG LOG
    console.log("🌐 Referer Check:", {
      SITE_URL: SITE_URL,
      referer: referer,
      includes: referer.includes(SITE_URL),
    });

    const isLocal =
      referer.includes("localhost") || referer.includes("127.0.0.1");
    const isProd = referer.includes(SITE_URL);

    if (!isLocal && !isProd) {
      console.log("Blocked Referer:", referer);
      return { statusCode: 403, body: "Unauthorized Source" };
    }

    if (!id || !token) return { statusCode: 400, body: "Missing Params" };

    // 3. AUTH: Verify User Token
    try {
      await admin.auth().verifyIdToken(token);
    } catch (authErr) {
      return { statusCode: 401, body: "Invalid Session" };
    }

    // 4. DATABASE: Get Book URL
    const db = admin.firestore();
    const bookDoc = await db.collection("books").doc(id).get();

    if (!bookDoc.exists) {
      return { statusCode: 404, body: "Book not found in database" };
    }

    const realUrl = bookDoc.data().indexURL;
    if (!realUrl) return { statusCode: 500, body: "Book URL missing in DB" };

    const baseUrl = realUrl.substring(0, realUrl.lastIndexOf("/") + 1);

    // 5. FETCH: Get actual HTML content
    const response = await fetch(realUrl);
    if (!response.ok)
      return { statusCode: response.status, body: "Upstream Error" };

    let html = await response.text();

    // 6. INJECTION: Base tag and Security Scripts
    const baseTag = `<base href="${baseUrl}">`;
    const protectionScript = `
      <script>
        // Prevent framing outside of your site
        if (window.self === window.top) { 
          window.location.href = "${SITE_URL}"; 
        }
        // Basic Right-Click Protection
        document.addEventListener('contextmenu', e => e.preventDefault());
      </script>`;

    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>\n${baseTag}${protectionScript}`);
    } else {
      html = baseTag + protectionScript + html;
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      },
      body: html,
    };
  } catch (err) {
    console.error("Proxy function crash:", err);
    return { statusCode: 500, body: `Internal Server Error: ${err.message}` };
  }
};
