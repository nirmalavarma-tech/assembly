This project is created to pull the visitor stats according to date passed in the URL.
Make sure you have a running environment in node.js (If not, kindly install node from this url, https://nodejs.org/en/download/)

Packages used:
npm install --save-dev nodemon (to keep track of changes made in the file and automatically restart the server)
npm install express --save

To test:
1. Go to the respective folder using cd command
2. Start the node using: npm run start command
   Once you do this, you shall see console message: 'RESTful API server started on: 3000'
3. You can then see the output on localhost: http://localhost:3000/api/visitors?date=DATE&ignore=MUSEUMTOIGNORE(optional)