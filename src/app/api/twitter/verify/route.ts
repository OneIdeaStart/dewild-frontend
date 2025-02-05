import { NextResponse } from 'next/server'

const BRIGHTDATA_TOKEN = process.env.BRIGHTDATA_TOKEN
const BRIGHTDATA_TRIGGER = 'https://api.brightdata.com/datasets/v3/trigger'
const BRIGHTDATA_SNAPSHOT = 'https://api.brightdata.com/datasets/v3/snapshot'

async function getSnapshot(snapshotId: string, retries = 3): Promise<any> {
 for (let i = 0; i < retries; i++) {
   await new Promise(resolve => setTimeout(resolve, 5000))
   const response = await fetch(`${BRIGHTDATA_SNAPSHOT}/${snapshotId}?format=json`, {
     headers: { 'Authorization': `Bearer ${BRIGHTDATA_TOKEN}` }
   })
   const data = await response.json()
   if (data.status !== 'running') return data
 }
 throw new Error('Snapshot timeout')
}

export async function POST(request: Request) {
 const { tweetUrl, verificationCode } = await request.json()

 if (!BRIGHTDATA_TOKEN) {
   return NextResponse.json({ verified: false, error: 'BRIGHTDATA_TOKEN not configured' }, { status: 500 })
 }

 try {
   const triggerResponse = await fetch(`${BRIGHTDATA_TRIGGER}?dataset_id=gd_lwxkxvnf1cynvib9co&include_errors=true`, {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${BRIGHTDATA_TOKEN}`,
       'Content-Type': 'application/json'
     },
     body: JSON.stringify([{ url: tweetUrl }])
   })

   const triggerData = await triggerResponse.json()
   if (!triggerResponse.ok || !triggerData.snapshot_id) {
     throw new Error(`Trigger error: ${triggerResponse.status}`)
   }

   const tweets = await getSnapshot(triggerData.snapshot_id)
   const tweet = Array.isArray(tweets) ? tweets[0] : tweets

   if (!tweet?.description) {
     return NextResponse.json({ verified: false, error: 'Tweet not found' })
   }

   console.log('Code comparison:', {
     verificationCode,
     inTweet: tweet.description
   })

   const isVerified = tweet.description.includes(verificationCode)
   console.log('Is verified:', isVerified)

   return NextResponse.json({ 
     verified: isVerified,
     actualWildRating: verificationCode,
     twitterHandle: tweet.user_posted
   })

 } catch (error) {
   console.error('Verification error:', error)
   return NextResponse.json({ verified: false, error: 'Failed to verify' })
 }
}