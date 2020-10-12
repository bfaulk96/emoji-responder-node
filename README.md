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
- [x] Add functionality to add/remove mappings from database for a team
- [ ] Add functionality to BULK add/remove mappings from database for a team
- [ ] Add functionality to get a list of mappings for a particular team
