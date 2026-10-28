# Preview servers: loopback receipt (2026-10-28)

Asked for by the Security Check chat, relayed by the Reading/composer coordinator. The four Usher preview servers were listening on every interface. They now listen on 127.0.0.1 only, with the same ports, roots and URL paths. No game runtime, content or deployment changed.

## Before

Each was `python3 -m http.server <port>` with no `--bind`, so it listened on `*:<port>` (IPv6 dual-stack, reachable from the LAN).

| Port | PID | Root (its working directory) | Started by |
|---|---|---|---|
| 8300 | 1612 | `~/Documents/Usher/game` | an earlier builder run; orphaned (parent 1) |
| 8116 | 2859 | `~/Documents/Usher/game` | the flight recut builder (`briefs/recut-flight.md`); orphaned |
| 8106 | 90456 | `~/Documents/Usher/game` | the flight builder (`handoffs/HANDOFF-game-flight.md`) |
| 8200 | 91135 | `~/Documents/Usher/work` | this coordinator, to show the style boards |

All four are still relevant:
- 8300 is the milestone server named in `STATE.md` and the audio handoff, and it hosts the reviewer's self-test.
- 8116 and 8106 are the flight harness ports in its brief and handoff.
- 8200 serves the style boards.

So all four were restarted rather than retired.

## After

Each was stopped and restarted as
`python3 -m http.server <port> --bind 127.0.0.1 --directory <same root>`, detached (parent 1) like the old 8300.

| Port | PID | `lsof` listener | Root |
|---|---|---|---|
| 8300 | 15340 | `TCP 127.0.0.1:8300 (LISTEN)` | `~/Documents/Usher/game` |
| 8116 | 15341 | `TCP 127.0.0.1:8116 (LISTEN)` | `~/Documents/Usher/game` |
| 8106 | 15342 | `TCP 127.0.0.1:8106 (LISTEN)` | `~/Documents/Usher/game` |
| 8200 | 15343 | `TCP 127.0.0.1:8200 (LISTEN)` | `~/Documents/Usher/work` |

## Checked

- **The URL paths answer 200** (curl):
  - `localhost:8300/?chapter=studio&through=studio`
  - `localhost:8300/games/studio/?mode=burial&fixture=1`
  - `127.0.0.1:8300/games/studio/selftest.html`
  - `localhost:8116/games/flight/`
  - `localhost:8106/games/flight/`
  - `localhost:8200/`
- **The self-test still passes in a browser.** The studio self-test at `127.0.0.1:8300` passed in Claude's Chromium pane after the restart.
- **The LAN address is refused.** Requests to the machine's LAN address on all four ports were refused.
- **IPv6 loopback is refused too.** `[::1]` is refused on all four ports. `localhost` still works, because curl and Chromium fall back to 127.0.0.1.

## Exceptions and limits

- **No deliberate exception.** No port was left on a wildcard interface.
- **IPv4 only.** A client that tries only `::1` for `localhost` won't connect. Use `127.0.0.1` there.
- **A restart can reopen the exposure.** These processes don't survive a reboot. Restarting one without `--bind 127.0.0.1` would expose it again. The commands in `AGENTS.md` and `COORDINATION-HANDOFF.md` now include the flag.
- **Older briefs still show the old command.** The commands in the earlier briefs and handoffs (`briefs/recut-flight.md`, `handoffs/HANDOFF-game-flight.md`) are left as records of what was briefed.
- **The 8312 audition server was not touched.** It belongs to the Reading audition.
