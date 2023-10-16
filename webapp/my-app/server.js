const express = require("express");
const path = require("path");
const app = express();

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle any requests that don't match the above
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, "192.168.230.6", () => {
	console.log(`Server is listening on port ${port}`);
});
