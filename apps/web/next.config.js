const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ("shared", "db") ship as raw TypeScript, so Next
  // needs to transpile them itself rather than expecting pre-built JS.
  transpilePackages: ["shared", "db"],
};

module.exports = nextConfig;
