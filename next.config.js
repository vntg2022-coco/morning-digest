/** @type {import('next').NextConfig} */
module.exports = {
  // `npm run verify` builds into a separate folder so it can run while
  // `npm run dev` is using .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
}
