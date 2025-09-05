const express = require("express");
const path = require("path");

const app = express();

// Serve Angular build output (from /browser folder)
app.use(express.static(path.join(__dirname, "dist/angular-localstorage-table/browser")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "dist/angular-localstorage-table/browser/index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
