# roblox-presence-tracker

[![Built with the Deno Standard Library](https://img.shields.io/badge/Built_with_Deno-black?logo=deno)](https://deno.com)
[![Built with the Deno Standard Library](https://img.shields.io/badge/Built_with_std-blue?logo=deno)](https://jsr.io/@std)

typescript script to track roblox users' playing games/last online. created for
practicing interaction with external apis.

this uses the legacy web apis for roblox. functionality is not guaranteed. this
is due to the lack of functionality of the new open cloud apis.

## setup

configure enviornment variables as in `.env.example`

in `main.ts`, modify the config, which includes `requestData`, `timespan`, and
`timeBetweenPresenceRequests`. make sure to make these so that you don't get
ratelimited

## run it

```bash
deno task dev
```
