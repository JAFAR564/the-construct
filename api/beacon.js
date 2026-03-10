export default function handler(req, res) {
  const { uid, name = 'UNKNOWN', faction = 'TECHNOCRATS', sector = '0' } = req.query;

  if (!uid) {
    return res.redirect('/');
  }

  // Build text for dynamic OG Image using placehold.co
  const line1 = `WARNING: ARCHITECT [${name}]`;
  const line2 = `IS PINNED IN SECTOR [${sector}]`;
  const line3 = `${faction} REINFORCEMENTS REQ.`;
  const placeholdText = encodeURIComponent(`${line1}\n${line2}\n${line3}`);

  // Use a hacker green terminal color schema
  const imageUrl = `https://placehold.co/1200x630/0A0A0A/00ff00.png?text=${placeholdText}&font=Share+Tech+Mono`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Distress Beacon - The Construct</title>
        <meta property="og:title" content="Distress Beacon Deployed!" />
        <meta property="og:description" content="Click to assist ${name} and earn Prestige in The Construct." />
        <meta property="og:image" content="${imageUrl.replace(/&/g, '&amp;')}" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:type" content="website" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content="Distress Beacon Deployed!" />
        <meta property="twitter:description" content="Click to assist ${name} and earn Prestige in The Construct." />
        <meta property="twitter:image" content="${imageUrl.replace(/&/g, '&amp;')}" />
        <script>
          window.location.href = "/?recruit=" + encodeURIComponent("${uid}");
        </script>
      </head>
      <body>
        <p style="color: #00ff00; font-family: monospace; background: #0a0a0a;">
          ROUTING TO THE GRID...
        </p>
      </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
