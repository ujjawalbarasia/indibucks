---
description: Deploy IndiBucks to Vercel
---

# Deploy to Vercel

This workflow guides you through deploying your application to Vercel.

## Prerequisites
- You need a Vercel account.
- You need the Vercel CLI installed (`npm i -g vercel`) OR use the Git integration.

## Steps

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   Run the deploy command from the root of your project:
   ```bash
   vercel
   ```
   - Follow the prompts (Set up and deploy? [Y]).
   - Link to existing project? [N] (unless you have one).
   - Project Name? (indibucks-neo).
   - Directory? (./).

3. **Environment Variables**
   **CRITICAL**: You must set the following environment variables in Vercel Project Settings > Environment Variables.
   
   - `BSE_MEMBER_ID`: Your BSE Member ID (or use "DEMO" for simulation).
   - `BSE_PASSWORD`: Your BSE Password.
   - `VITE_GEMINI_API_KEY`: Your Gemini API Key (for the AI features).

4. **Production Check**
   Once deployed, Vercel gives you a URL. Open it and check:
   - Does the Dashboard load?
   - Can you open the KYC modal?

## Troubleshooting
- If API calls fail with 404, check `vercel.json` rewrites.
- If AI features fail, check `VITE_GEMINI_API_KEY`.
