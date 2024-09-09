require("dotenv").config();
require("express-async-errors");
//express
const cors = require("cors");
const express = require("express");
const app = express();
const { Server } = require("socket.io");
app.use(cors());

// rest of the packages
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
//database
const connectDB = require("./config/connectDB");

//routers
const authRouter = require("./routers/auth");
const companyRouter = require("./routers/company");
const projectRouter = require("./routers/project");
const planRouter = require("./routers/plan");
const taskRouter = require("./routers/task");
const formRouter = require("./routers/Form");
const searchRouter = require("./routers/search");

//midlleware
const notFoundMiddleware = require("./middleware/not-found");
const erorHandlerMiddleware = require("./middleware/eror-handler");

//app
app.use(morgan("tiny"));
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET_KEY));

app.use(express.static("./public"));
app.use(express.urlencoded({ extended: true }));

app.use("/v1/auth", authRouter);
app.use("/v1/company", companyRouter);
app.use("/v1/project", projectRouter);
app.use("/v1/plan", planRouter);
app.use("/v1/task", taskRouter);
app.use("/v1/form", formRouter);
app.use("/v1/search", searchRouter);

app.use(notFoundMiddleware);
app.use(erorHandlerMiddleware);

const port = process.env.PORT || 3040;

const start = async () => {
  await connectDB(process.env.MONGO_URL);
  let server;
  server = app.listen(
    port,
    console.log(
      `MongoDb Connection Successful,App started on port ${port} : ${process.env.NODE_ENV}`
    )
  );

  //socket io
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

 io.on("connection", (socket) => {
   socket.on("join_room", (roomId) => {
     socket.join(roomId);
   });

   socket.on("send_message", (data) => {
     socket.broadcast.to(data.taskId).emit("receive_message", data);
   });

   socket.on("disconnect", () => {
     console.log("User disconnected");
   });
 });
};

start();
