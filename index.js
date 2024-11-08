import express from 'express';
import connect from './db.js';
import rootRoutes from './src/routes/rootRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//tạo object tổng của express
const app = express();

//thêm middleware cors để nhận request từ FE hoặc bên khác

app.use(cors({
    origin: "http://localhost:3000",
    credentials: true // set true để BE nhận được cookie từ FE
}));

//thêm middleware để get info cookie từ request FE hoặc postman
app.use(cookieParser());

//thêm middleware để covert string về API POST và PUT
app.use(express.json());

//import rootRoutes
app.use(rootRoutes); 



// define port cho BE
app.listen(8080, () => {
    console.log("BE starting with port 8080");
})
//npx sequelize-auto -h localhost -d node47_youtube -u root -x 123456 -p 3305 --dialect mysql -o src/models -l esm