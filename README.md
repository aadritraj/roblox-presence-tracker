# roblox-presence-tracker 
built with [deno 2](deno.com) 

typescript script to track roblox users' playing games/last online.
created for practicing interaction with external apis.

this uses the legacy web apis for roblox. functionality is not guaranteed.
this is due to the lack of functionality of the new open cloud apis.

## setup
copy ``.env.example`` or rename to ``.env``
fill in the fields with the required values.

``ROBLOX_COOKIE`` must be formatted in a curl-accepted manner for cookies.

in ``main.ts``, modify ``requestData`` with the user ids you wish to track.
``timespan`` can be modified to modify the time (in ms) between requests.

you may be ratelimited if this is too low

## run it
in whichever terminal emulator (or tty), run:
```bash
deno task dev
```