const fetch = require("node-fetch");
const admin = require("firebase-admin");

// Firebase Admin init
if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  console.log("Admin init:", {
    hasProjectId: !!projectId,
    hasPrivateKey: !!privateKey,
    hasClientEmail: !!clientEmail,
  });

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey: privateKey ? privateKey.replace(/\\n/g, "\n") : undefined,
      clientEmail,
    }),
  });
}

exports.handler = async (event) => {
  try {
    const { id, token } = event.queryStringParameters || {};

    const referer = event.headers.referer || event.headers.referrer || "";
    if (
      !referer.includes("https://digital-learning-vault.netlify.app") &&
      !referer.includes("localhost")
    ) {
      return { statusCode: 403, body: "Unauthorized Source" };
    }

    if (!id || !token) return { statusCode: 400, body: "Missing Params" };

    await admin.auth().verifyIdToken(token);

    const db = admin.firestore();
    const bookDoc = await db.collection("books").doc(id).get();

    if (!bookDoc.exists) {
      return { statusCode: 404, body: "Book not found in database" };
    }

    const realUrl = bookDoc.data().indexURL;
    const baseUrl = realUrl.substring(0, realUrl.lastIndexOf("/") + 1);

    const response = await fetch(realUrl);
    if (!response.ok)
      return { statusCode: response.status, body: "Upstream Error" };

    let html = await response.text();

    const baseTag = `<base href="${baseUrl}">`;
    const protectionScript = `
      <script>
        if (window.self === window.top) { window.location.href = "https://your-app.com"; }
        document.addEventListener('contextmenu', e => e.preventDefault());
      </script>`;

    if (html.includes("<head>")) {
      html = html.replace("<head>", `<head>\n${baseTag}${protectionScript}`);
    } else {
      html = baseTag + protectionScript + html;
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: html,
    };
  } catch (err) {
    console.error("Proxy error:", err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};
