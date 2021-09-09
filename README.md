# Take-Tac-Toe

TODO: add description here

## Getting Started

### Prerequisites

This project uses Node.js as the framework. Make sure you have Node.js installed first if you wish to run the project locally.

### Running locally

#### Server

1. Open a terminal.
1. Clone this repository: `git clone https://github.com/rethramos/stdiscm-mco2.git`
1. Navigate to the project root.
1. Run `npm install`.
1. Run `npm start`.
1. You should see this message in the terminal: `listening on *:3000`

#### Client

The number of clients the server can handle depends on the `MAX_SQUAD_SIZE` variable in `server.js`. For example, if `MAX_SQUAD_SIZE = 2`, then the server expects 4 players. Edit the value of `MAX_SQUAD_SIZE` to your desired squad size, then run the server again using `npm start`. Afterwards, do the following:

1. Open `MAX_SQUAD_SIZE * 2` browser tabs.
1. For each tab, enter a username.
1. Wait until all tabs are in the waiting queue.
1. The game begins once the `MAX_SQUAD_SIZE * 2` players have entered a username.

## Authors
