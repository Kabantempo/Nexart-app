#!/usr/bin/env node
/**
 * Nexart DevOps Monitor
 * Utilise l'agent global pour monitorer la marketplace
 */

const DevOpsAgent = require("../agents/devops-agent");
const config = require("../agents/config.json");

const nexartConfig = config.devops.monitoring.nexart || {
  domain: "nexart.dev",
  alertThreshold: 80
};

const agent = new DevOpsAgent({
  hostingerDomain: nexartConfig.domain,
  alertThreshold: nexartConfig.alertThreshold
});

const command = process.argv[2] || "help";

if (command === "check") {
  console.log("🔍 Nexart DevOps Check...\n");
  agent.monitor({
    verbose: true,
    maxProcesses: parseInt(process.argv[3] || "0"),
    interval: 0
  });
} else if (command === "watch") {
  const seconds = parseInt(process.argv[3] || "60");
  console.log(`⏱️  Watching ${nexartConfig.domain} every ${seconds}s\n`);
  agent.monitor({
    verbose: true,
    maxProcesses: parseInt(process.argv[4] || "0"),
    interval: seconds * 1000
  });
} else {
  console.log(`
🔧 Nexart DevOps Monitor

Commands:
  node devops-monitor.js check
  node devops-monitor.js watch [seconds]

Examples:
  node devops-monitor.js check
  node devops-monitor.js watch 300
  `);
}
