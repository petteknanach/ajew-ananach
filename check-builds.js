#!/usr/bin/env node

/**
 * Check EAS Build Status
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function checkBuilds() {
  console.log('🔍 Checking EAS Build Status...\n');
  
  try {
    // Check recent builds
    const { stdout } = await execPromise('npx eas build:list --limit 5 --non-interactive');
    console.log('Recent Builds:');
    console.log(stdout);
    
    // Check if builds are in progress
    if (stdout.includes('IN_QUEUE') || stdout.includes('NEW') || stdout.includes('IN_PROGRESS')) {
      console.log('\n🚀 Builds are in progress!');
      console.log('Monitor at: https://expo.dev/accounts/petteknanach/projects/ajew-ananach/builds');
    } else if (stdout.includes('ERROR')) {
      console.log('\n❌ Some builds have errors.');
    } else if (stdout.includes('FINISHED')) {
      console.log('\n✅ Builds completed successfully!');
    } else {
      console.log('\n📊 Build status unknown.');
    }
    
  } catch (error) {
    console.log('❌ Error checking build status:', error.message);
    console.log('\nYou can manually check at:');
    console.log('https://expo.dev/accounts/petteknanach/projects/ajew-ananach/builds');
  }
  
  console.log('\n🦞 Na Nach Nachma Nachman Me\'Uman!');
}

checkBuilds();