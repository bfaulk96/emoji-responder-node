# Emoji Responder

#### Responds with emojis to keywords or phrases in a Slack server
Built with NodeJS and Typescript

### Endpoints:
- Receives messages from Slack channel and reacts with emojis if matches are found in team emoji mappings
- Receives slash command from Slack channel and update team's emoji mappings accordingly

### Current Roadmap:
- [x] Connect to database
- [x] Clean up typings and comments
- [x] Add error check(s) to Slack calls
- [x] Add/remove mappings from database for a team
- [ ] Bulk add/remove mappings from database for a team
- [ ] Get a list of mappings for a particular team via slash command
- [ ] Allow simple regex mappings?
- [ ] Add demo gif to README

#### Privacy:
Note that in order for this to work, it reads every single message sent to a channel this bot is in.
That being said, these messages are never stored, only used to find keywords for mappings.

Team Ids are stored in order to find your team's mappings to add/remove/etc from DB
