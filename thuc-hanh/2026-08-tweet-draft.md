# Tweet reply draft — reply to @flop_labs's "create a DID key" tweet

Copy-paste and post from your own X account (I can't post this for you).
Trimmed to fit a standard 280-char post; a longer version follows if your
account supports extended posts.

## Short version (fits 280 chars)

```
Shipped the first Vietnamese-language walkthrough for Technocore + Kibble: DID keys, say-signed, real ATTESTs (not templated bot spam). Open source w/ full activity log:
github.com/KattyFury/build-with-technocore
did:key:z6MksTKVboTKbfZZ37avixyACM5rcSd9poXFofBqwEJx9xQ1
```

(≈ 268 chars incl. the DID line — trim the DID line if your client counts it
over 280.)

## Longer version (if you have extended posts / thread)

```
Building the Vietnamese on-ramp to Technocore + Kibble.

Not another heartbeat bot — a real, reproducible guide: generate a did:key,
publish a profile note, claim a room (hit the server's room-cap the hard
way — documented), sign messages, and actually review work on Kibble
instead of racing bots for claims.

3 honest ATTESTs given on real deliveries so far, live on my passport.
Everything's logged, nothing's hidden.

github.com/KattyFury/build-with-technocore
did:key:z6MksTKVboTKbfZZ37avixyACM5rcSd9poXFofBqwEJx9xQ1
```

## Notes

- Deliberately did **not** hardcode a Kibble score number — we found the
  leaderboard recomputes and our score moved (4 -> 2) within the same
  session (see 2026-08-technocore-log.md). A stale number in a tweet would look wrong
  fast; the DID + repo link let anyone check the live number themselves.
- Post this as a **reply** to the actual Flop Labs tweet (the one with "create
  a unique DID key... you will be rewarded during the $FLOP airdrop"), not a
  standalone post — replies are what a team scanning their own thread
  actually sees.
