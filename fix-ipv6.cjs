// WSL2 IPv6 fix: Node.js v24 Happy Eyeballs tries IPv6 first,
// which hangs in WSL2. This shortens the IPv6 attempt timeout
// so it quickly falls back to IPv4.
const net = require("net");
net.setDefaultAutoSelectFamilyAttemptTimeout(300);
