const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");

admin.initializeApp();
const db = admin.firestore();

async function doParse() {
  const url = "https://onlineradiobox.com/ua/coma/playlist/";
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const rows = $(".playlist .tracklist li");

  const batch = db.batch();
  rows.each((_, el) => {
    const time = $(el).find(".time").text().trim();
    const artist = $(el).find(".artist").text().trim();
    const title = $(el).find(".title").text().trim();

    const doc = db.collection("tracks_history").doc();
    batch.set(doc, {
      timestamp: admin.firestore.Timestamp.now(),
      artist,
      title,
      time_scraped: time,
    });
  });

  await batch.commit();
  console.log("Parsed and stored", rows.length, "tracks.");
}

// Cron
exports.parsePlaylist = functions.pubsub
  .schedule("every day 03:00")
  .timeZone("Europe/Kyiv")
  .onRun(doParse);

// Manual trigger
exports.manualParse = functions.https.onRequest(async (req, res) => {
  await doParse();
  res.send("Manual parsing complete.");
});

// Chart API
exports.getWeeklyChart = functions.https.onRequest(async (req, res) => {
  const weekAgo = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  const snapshot = await db
    .collection("tracks_history")
    .where("timestamp", ">", weekAgo)
    .get();

  const counter = {};
  snapshot.forEach(doc => {
    const { artist, title } = doc.data();
    const key = `${artist} – ${title}`;
    counter[key] = (counter[key] || 0) + 1;
  });

  const top = Object.entries(counter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count], i) => ({
      rank: i + 1,
      track: name,
      plays: count,
    }));

  res.set("Cache-Control", "public, max-age=3600");
  res.json({ chart: top });
});