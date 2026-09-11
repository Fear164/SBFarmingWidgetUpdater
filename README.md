# Skyblock Farming Widget Updater

A GitHub Actions-based Skyblock Farming stats fetcher that automatically updates a Discord application profile widget.
it is a modified version of 

Runs every 5 Minutes or manually via workflow dispatch.


---

## Quick Start (Fork & Use)

### 1. Fork this repository

Click the Fork button on GitHub (top right).

Then clone your fork (optional):

```bash
git clone https://github.com/YOUR_USERNAME/SBFarmingWidgetUpdater.git
cd SBFarmingWidgetUpdater
````

---

### 2. Add GitHub Secrets

Go to:

```
Settings → Secrets and variables → Actions → New repository secret
```

Add the following:

| Secret          | Description            |
| --------------- | ---------------------- |
| PROFILE_UUID    | Skyblock Profile ID    |
| PLAYER_UUID     | Minecraft UUID         |
| BOT_TOKEN       | Discord bot token      |
| APPLICATION_ID  | Discord application ID |
| DISCORD_USER_ID | Your Discord user ID   |

Important:

* Do not use quotes
* Do not use `{}` placeholders
* Paste raw values only

---

### 3. Enable GitHub Actions

Go to:

```
Actions → Enable workflows
```

Approve if prompted.

---

### 4. Run manually (first test)

Go to:

```
Actions → Update Farming Widget → Run workflow
```

Check logs for:

* EliteAPI data fetched
* Stats calculated
* Discord update successful

---

## Automatic Updates

Runs every 5 minutes:

```yaml
*/5 * * * *
```

---

## What it does

Each run:

1. Fetches Skyblock profile data
2. Displays:

   * Farming Level
   * Skill XP
   * Pest Kills
   * Favourite Crop Collection (Currently limited to Moonflower)
   * Total Copper
   * Total Visitors served
3. Builds widget payload
4. Sends PATCH request to Discord API
5. Updates your profile widget

---

## Requirements

* Skyblock Profile must be accessible via Hypixel API and Elite Farmers API
* Discord application with widget support
* GitHub Actions enabled

---

## Common Issues

### Missing secrets error

GitHub Secrets were not configured correctly.

### Discord API 400 error

Incorrect APPLICATION_ID or DISCORD_USER_ID.

### Workflow not running automatically

* Must be on default branch
* GitHub cron may have delays

---

## Security

* Never hardcode secrets in code
* Never commit .env files
* Always use GitHub Secrets

```
