module.exports = {
  planGroups: {
    // Map Lemon Squeezy variant IDs to OWUI group names
    // e.g., "12345": "plan:standard"
  },
  owui: {
    apiBaseUrl: process.env.OWUI_API_BASE_URL,
    apiToken: process.env.OWUI_API_TOKEN,
  },
  lemonSqueezy: {
    webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
  },
};
