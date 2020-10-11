# Emoji Responder

#### Responds with emojis to keywords or phrases in a Slack server
Built with NodeJS and Typescript

### Endpoints:
- POST https://emoji-responder-node-git-main.bfaulk96.vercel.app/api/serverless
    - Receives messages from Slack channel and reacts with emojis if matches are found in team emoji mappings

### Current Roadmap:
- [x] Connect to database
- [ ] Clean up typings and comments
- [x] Add error check(s) to Slack calls
- [ ] Add endpoint to change log level dynamically (for easier debugging)?
- [ ] Add functionality to add/remove mappings from database for a team
- [ ] Add functionality to get a list of mappings for a particular team
