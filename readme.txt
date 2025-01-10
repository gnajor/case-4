For Teammates
- To start the server you need to navigate to the directory ..../case-4 and run the command: deno task start-server.
- To be able to do this you need to download deno which is done by writing a command in the Command Prompt which you can find on denos websites.


Problem
- I have an issue where, if someone clicks "Play Again" while others are still on the leaderboard page, 
  they are automatically brought back to the room if they reload the page. This happens because the key currentState is set to "lobby", 
  which means that if someone reloads while in the room, they are redirected there as well. 



Extra features
- An encrypt function and a decrypt function are available, which might seem unnecessary since the encode and decode methods are public. 
  However, they provide an added layer of security and are still an improvement over the default implementation.

- The wsDataGetter file ensures that users can reload the page and remain on the same page without being thrown out of the room. 
  If someone attempts to navigate directly to /room/leaderboard, they will automatically be redirected to the room's current state.

- If a player leaves the game by closing their socket connection, they will have 15 seconds to reconnect before being redirected to the /home page.



Description:    

Components, entities and userState 
- The components, entities, and userState files are used by the pages folder to construct and manage the various pages of the application.

Pages and PageHandler
- The pages then send data to the pageHandler, which processes the information and routes it to either the API or the index.js file as needed.

index.js
- The index.js file handles the client side WebSocket and serves as the entry point for the frontend.
- It also manages communication with the server by sending the necessary data.

Server and WebSocket Handlers'
- The server utilizes wsHandlers for managing WebSocket events and wsState to efficiently store and handle all data related to WebSocket connections. 
  This setup ensures the necessary data is sent to the frontend (index) to update the user interface seamlessly.

API
- The API is responsible for storing and retrieving user data.

PageHandler and URL Management
- The pageHandler determines what content to load by using the URL, ensuring the correct page is displayed when a user reloads the application.
