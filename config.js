module.exports = {
  planPrefix: 'plan:',
  planGroups: {
    // Map Lemon Squeezy variant IDs to OWUI group names
      'aa2befc2-ac07-4da0-a601-34cf1e5bff2e': 'plan:student',
      '1e344447-7932-4d60-bda9-803cba73f9f7': 'plan:standard',
      '0cc965b1-0ae3-4ef2-86d0-6e99e305888a': 'plan:pro',
  },
  grantStatuses: ['active', 'on_trial'],
  owui: {
    apiBaseUrl: process.env.OWUI_API_BASE_URL,
    apiToken: process.env.OWUI_API_TOKEN,
  },
  lemonSqueezy: {
    webhookSecret: process.env.LEMON_SQUEEZY_WEBHOOK_SECRET,
  },
};
