#!/usr/bin/env node
/**
 * Opens Simulator.app and boots the first available iPhone simulator.
 * Fixes: "CommandError: No iOS devices available in Simulator.app"
 */
import { execSync, spawnSync } from 'node:child_process';

function listDevicesJson() {
  try {
    const out = execSync('xcrun simctl list devices available -j', {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function pickFirstIphone(data) {
  const buckets = data?.devices;
  if (!buckets || typeof buckets !== 'object') return null;
  const runtimes = Object.keys(buckets).filter((k) => k.includes('iOS'));
  runtimes.sort();
  for (const rt of runtimes) {
    const list = buckets[rt];
    if (!Array.isArray(list)) continue;
    const phones = list.filter((d) => d?.isAvailable && typeof d.name === 'string' && d.name.includes('iPhone'));
    phones.sort((a, b) => a.name.localeCompare(b.name));
    if (phones.length) return phones[0];
  }
  return null;
}

function main() {
  const data = listDevicesJson();
  if (!data) {
    console.error(
      'Could not read simulators. Install Xcode and an iOS runtime (Xcode → Settings → Platforms → iOS).',
    );
    process.exit(1);
  }

  const device = pickFirstIphone(data);
  if (!device) {
    console.error(
      'No available iPhone simulator found. Open Xcode → Settings → Platforms → download an iOS Simulator runtime, then retry.',
    );
    process.exit(1);
  }

  spawnSync('open', ['-a', 'Simulator'], { stdio: 'inherit' });

  const r = spawnSync('xcrun', ['simctl', 'boot', device.udid], { encoding: 'utf8' });
  const err = `${r.stderr || ''}${r.stdout || ''}`;
  const okAlready =
    r.status === 0 ||
    err.includes('currently Booted') ||
    err.includes('current state: Booted') ||
    err.includes('Unable to boot device in current state: Booted');
  if (!okAlready) {
    console.error(err.trim() || 'simctl boot failed');
    process.exit(r.status ?? 1);
  }

  console.log(`Simulator ready: ${device.name} (${device.udid})`);
}

main();
