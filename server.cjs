const express = require('express');
const path = require('path');

const app = express();

const distPath = path.join(
  __dirname,
  'dist',
  'ecotrack',
  'browser'
);

app.use(
  express.static(distPath)
);

app.use((req, res) => {
  res.sendFile(
    path.join(
      distPath,
      'index.html'
    )
  );
});

const port =
  process.env.PORT || 8080;

app.listen(
  port,
  '0.0.0.0',
  () => {
    console.log(
      `EcoTrack frontend running on port ${port}`
    );
  }
);
