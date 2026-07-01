// Elite → Discord Widget Updater
// Runs in GitHub Actions

// Environment Variables

const {
  BOT_TOKEN,
  APPLICATION_ID,
  DISCORD_USER_ID,
  PLAYER_UUID,
  PROFILE_UUID,
} = process.env;

// Validate Secrets

const requiredSecrets = [
  "BOT_TOKEN",
  "APPLICATION_ID",
  "DISCORD_USER_ID",
  "PLAYER_UUID",
  "PROFILE_UUID",
];

for (const secret of requiredSecrets) {
  if (!process.env[secret]) {
    throw new Error(`Missing GitHub Secret: ${secret}`);
  }
}

// Logging

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Delay Helper

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch JSON with Retries

async function farming(url, retries = 3) {
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text();

        throw new Error(`Elite API ${res.status}\n${text}`);
      }

      return await res.json();
    } catch (err) {
      lastError = err;

      log(`Elite request failed (${attempt}/${retries})`);

      if (attempt !== retries) {
        await delay(1500);
      }
    }
  }

  throw lastError;
}

// Discord Widget Updater

async function updateDiscordWidget(widget) {
  log("Updating Discord widget...");

  const response = await fetch(
    `https://discord.com/api/v9/applications/${APPLICATION_ID}/users/${DISCORD_USER_ID}/identities/0/profile`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent":
          "DiscordBot (https://github.com/discord/discord-api-docs, 1.0.0)",
      },
      body: JSON.stringify(widget),
    },
  );

  if (!response.ok) {
    const text = await response.text();

    throw new Error(`Discord API ${response.status}\n${text}`);
  }

  log("Discord widget updated.");
}

// Main

async function main() {
  log("Fetching Elite data...");

  const [profileData, lbData] = await Promise.all([
    farming(
      `https://api.eliteskyblock.com/profile/${PLAYER_UUID}/${PROFILE_UUID}`,
    ),
    farming(
      `https://api.eliteskyblock.com/leaderboard/rank/pests/${PLAYER_UUID}/${PROFILE_UUID}`,
    ),
  ]);

  log("Calculating statistics...");

  // Top Widget Level
  const skillData = profileData.stats.skills.levels.farming;

  const xp = abbreviate(skillData.xp, 2, false, false);
  const farmingLevel = skillData.level;

  //Bottom Widget Handler
  const pestKills = abbreviate(lbData.amount, 2, false, false);
  const favCropData = abbreviate(
    profileData.collections.MOONFLOWER,
    2,
    false,
    false,
  );
  const copperData = abbreviate(profileData.unparsed.copper, 2, false, false);
  const visitorData = abbreviate(
    profileData.garden.completedVisitors,
    2,
    false,
    false,
  );

  // Mini Profile Handler
  const weightData = profileData.farmingWeight.totalWeight;

  // Console Summary

  log("-----------------------------");
  console.log(`Skill Level: ${farmingLevel}`);
  console.log(`XP: ${xp}`);
  console.log(`Pest Kills: ${pestKills}`);
  console.log(`Moonflower: ${favCropData}`);
  console.log(copperData);
  console.log(`Visitors served: ${visitorData}`);
  console.log(`Farming Weight: ${weightData.toFixed(2)}`);
  log("-----------------------------");

  log("Building widget payload...");

  const widget = {
    data: {
      dynamic: [
        {
          type: 1,
          name: "farmingLevel",
          value: String(farmingLevel) || "Unknown",
        },
        {
          type: 1,
          name: "xp",
          value: String(xp) || "Unknown",
        },
        {
          type: 1,
          name: "pestKills",
          value: String(pestKills) || "Unknown",
        },
        {
          type: 1,
          name: "favCropData",
          value: String(favCropData) || "Unknown",
        },
        {
          type: 1,
          name: "copperData",
          value: String(copperData) || "Unknown",
        },
        {
          type: 1,
          name: "visitorData",
          value: String(visitorData) || "Unknown",
        },
        {
          type: 1,
          name: "weightData",
          value: String(weightData) || "Unknown",
        },
      ],
    },
  };

  log("Widget preview:");
  console.log(JSON.stringify(widget, null, 2));

  await updateDiscordWidget(widget);

  log("Farming widget update completed successfully.");
}

main()
  .then(() => {
    log("Finished successfully.");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
