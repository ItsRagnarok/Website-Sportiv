const { isAuthenticated } = require("./lib/auth");

module.exports = async function handler(req, res) {
  let authenticated = false;
  try {
    authenticated = isAuthenticated(req);
  } catch {
    authenticated = false;
  }
  res.status(200).json({ authenticated });
};
