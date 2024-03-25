require('dotenv').config();
const http=require('http');


const app=require('./app/app');

require('./config/dbConnect');

const Port=process.env.PORT||3000;


const Server=http.createServer(app);

Server.listen(Port,console.log(`Server is running ${Port}`));